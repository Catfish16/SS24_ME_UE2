import React, { FormEvent, useState } from "react";
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

// init nlp model
const nlp = winkNLP(model);

interface HighlightedSentence {
    sentence: string;
    uniqueCount: number;
    totalCount: number;
    title: string;
    abstract: string;
    copyright: string;
    pubmedLink: string;
}

const PubMedSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [resNum, setResNum] = useState(10);
    const [sensitivity, setSensitivity] = useState(0.5);
    const [popupContent, setPopupContent] = useState<HighlightedSentence | null>(null);

    /**
     * Highlights keywords in a given text by wrapping them in HTML <mark> tags.
     *
     * @param {string} text - The text to be highlighted.
     * @param {string[]} keywords - An array of keywords to be highlighted.
     * @return {string} - The text with keywords wrapped in <mark> tags.
     */
    const highlightKeywords = (text: string, keywords: string[]) => {
        const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
        return text.replace(regex, (match) => `<mark>${match}</mark>`);
    };

    /**
     * Display search results.
     *
     * @param {string[]} articles - Array of articles to display.
     */
    const displayResults = (articles: string[]) => {
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = '';
            const keywords = searchTerm.split(' ').map(kw => kw.replace(/"/g, ''));

            const highlightedSentences: HighlightedSentence[] = [];

            articles.forEach((article: string) => {
                // Parse the fields from the json response
                const titleMatch = article.match(/TI\s+-\s+([\s\S]*?)\nPG/m);
                const title = titleMatch ? titleMatch[1] : 'No title';

                const abstractMatch = article.match(/AB\s+-\s+(.*?)(?=\n[A-Z]{2}\s+-)/s);
                const abstract = abstractMatch ? abstractMatch[1] : 'No abstract available.';

                const copyrightMatch = article.match(/CI\s+-\s+([\s\S]*?)\nFAU/m);
                const copyright = copyrightMatch ? copyrightMatch[1] : 'No copyright information available.';

                const pubmedIdMatch = article.match(/^(.*?)\sOWN/);
                const pubmedId = pubmedIdMatch ? pubmedIdMatch[1].trim() : '';
                const pubmedLink = `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}`;

                //Use nlp to separate sentences for keyword matching per sentence
                const doc = nlp.readDoc(abstract);
                const sentences = doc.sentences().out();

                // Keyword matching
                sentences.forEach((sentence: string) => {
                    const keywordCounts = keywords.reduce((acc, keyword) => {
                        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                        const matches = sentence.match(regex);
                        if (matches) {
                            acc[keyword] = matches.length;
                        }
                        return acc;
                    }, {} as { [key: string]: number });

                    // Frequency should only consider unique keywords
                    const uniqueKeywords = Object.keys(keywordCounts).length;
                    const totalKeywords = Object.values(keywordCounts).reduce((sum) => sum, 0);

                    // * Required keywords are wrapped in " ", they must appear for a sentence to be highlighted
                    const requiredKeywords = searchTerm.split(' ').filter(kw => kw.startsWith('"') && kw.endsWith('"')).map(kw => kw.replace(/"/g, ''));
                    const requiredKeywordIncluded = requiredKeywords.every(rkw => sentence.toLowerCase().includes(rkw.toLowerCase()));

                    // Required keyword is included and enough unique keywords appear in the sentence
                    // Sensitivity can be set by the user, but query has to be executed again for it to take effect
                    if (requiredKeywordIncluded && uniqueKeywords >= keywords.length * sensitivity) {
                        const highlightedSentence = highlightKeywords(sentence, keywords);
                        highlightedSentences.push({ sentence: highlightedSentence, uniqueCount: uniqueKeywords, totalCount: totalKeywords, title, abstract, copyright, pubmedLink });
                    }
                });

                // Highlight keywords in the abstracts then append them to the results div
                const highlightedAbstract = highlightKeywords(abstract, keywords);
                const articleDiv = document.createElement('div');
                articleDiv.innerHTML = `<h3>${title}</h3><p>${highlightedAbstract}</p>`;
                resultsDiv.appendChild(articleDiv);
            });

            // Highlighted sentences are sorted based on the number of unique keywords they include
            highlightedSentences.sort((a, b) => {
                if (b.uniqueCount === a.uniqueCount) {
                    return b.totalCount - a.totalCount;
                }
                return b.uniqueCount - a.uniqueCount;
            });

            if (highlightedSentences.length > 0) {
                const highlightsDiv = document.createElement('div');
                highlightsDiv.className = 'highlighted-sentences';
                highlightsDiv.innerHTML = `<h2>Highlighted Sentences</h2>${highlightedSentences.map((s, index) => `<p key=${index} data-index=${index} style="margin-bottom: 10px;">${s.sentence}</p>`).join('')}`;
                resultsDiv.prepend(highlightsDiv);

                // Pop-up with further information for each sentence
                highlightsDiv.querySelectorAll('p').forEach((p, index) => {
                    p.addEventListener('click', () => {
                        setPopupContent(highlightedSentences[index]);
                    });
                });
            }
        }
    };

    /**
     * Executes a search using the provided event object.
     * @param {FormEvent<HTMLFormElement>} event - The form event object from the search form submission.
     * @returns {Promise<void>} - A promise that resolves once the search results are displayed.
     */
    const executeSearch = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${searchTerm}&retmode=json&retmax=10`;

        try {
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();
            const uids = searchData.esearchresult.idlist;

            if (uids.length > 0) {
                const uidsStr = uids.join(',');
                const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${uidsStr}&rettype=medline&retmode=text`;

                const fetchResponse = await fetch(fetchUrl);
                const fetchText = await fetchResponse.text();
                // Hack to separate the articles by a fixed value (PMID will be missing from results)
                const articles = fetchText.split(/PMID-/).filter(article => article.trim() !== '');

                displayResults(articles);
            }
        } catch (error) {
            const resultsDiv = document.getElementById('results');
            if (resultsDiv) {
                resultsDiv.innerHTML = `Search results couldn't be fetched at the moment. \n ${error}`;
            }
        }
    };

    return (
        <div id="searchArea">
            <form onSubmit={executeSearch}>
                <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button type="submit">
                    Search
                </button>
            </form>
            <div className="searchResultsSetting">
                <div>
                    Set the number of results
                </div>
                <input
                    type={"number"}
                    value={resNum}
                    max={30}
                    onChange={e => setResNum(Number(e.target.value))}/>
            </div>
            <div className="searchSensitivitySetting">
                <div>
                    Set search sensitivity
                </div>
                <button
                    className={sensitivity === 0.25 ? 'selected' : ''}
                    onClick={() => setSensitivity(0.25)}
                >
                    Low (25% of keywords)
                </button>
                <button
                    className={sensitivity === 0.5 ? 'selected' : ''}
                    onClick={() => setSensitivity(0.5)}
                >
                    Medium (50% of keywords)
                </button>
                <button
                    className={sensitivity === 0.75 ? 'selected' : ''}
                    onClick={() => setSensitivity(0.75)}
                >
                    High (75% of keywords)
                </button>
                <button
                    className={sensitivity === 1 ? 'selected' : ''}
                    onClick={() => setSensitivity(1)}
                >
                    Full (100% of keywords)
                </button>
            </div>
            <div id="results"/>
            {popupContent && (
                <div className="popup">
                    <span className="popup-close" onClick={() => setPopupContent(null)}>&times;</span>
                    <h3>{popupContent.title}</h3>
                    <h4>Abstract</h4>
                    <p dangerouslySetInnerHTML={{__html: highlightKeywords(popupContent.abstract, searchTerm.split(' ').map(kw => kw.replace(/"/g, '')))}}></p>
                    <h4>Copyright</h4>
                    <p>{popupContent.copyright}</p>
                    <a href={popupContent.pubmedLink} target="_blank" rel="noopener noreferrer">View on PubMed</a>
                </div>
            )}
        </div>
    );
};

export default PubMedSearch;
