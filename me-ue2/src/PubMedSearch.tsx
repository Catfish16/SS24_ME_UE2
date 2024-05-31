import React, { FormEvent, useState } from "react";

// Utility function to highlight keywords in the abstract
const highlightKeywords = (text: string, keywords: string[]) => {
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
};

const PubMedSearch: React.FC<PubMedSearchProps> = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const highlightKeywords = (text: string, keywords: string[]) => {
        const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
        return text.replace(regex, (match) => `<mark>${match}</mark>`);
    };

    const displayResults = (articles: string[]) => {
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = '';
            const keywords = searchTerm.split(' ');

            // remove the first element as it will be empty due to parsing
            articles.shift();

            articles.forEach((article: string) => {
                // Extract title (TI) and abstract (AB)
                const titleMatch = article.match(/TI\s+-\s+(.*)/);
                const title = titleMatch ? titleMatch[1] : 'No title';

                const abstractMatch = article.match(/AB\s+-\s+(.*)/s);
                const abstract = abstractMatch ? abstractMatch[1] : 'No abstract available.';

                // Highlight keywords in the abstract
                const highlightedAbstract = highlightKeywords(abstract, keywords);

                // Create and append article div
                const articleDiv = document.createElement('div');
                articleDiv.innerHTML = `<h3>${title}</h3><p>${highlightedAbstract}</p>`;
                resultsDiv.appendChild(articleDiv);
            });
        }
    };
    const executeSearch = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log(searchTerm);
        const searchUrl =
            `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${searchTerm}&retmode=json&retmax=10`;

        try {
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();
            const uids = searchData.esearchresult.idlist;

            console.log(searchData);

            if (uids.length > 0) {
                const uidsStr = uids.join(',');
                const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${uidsStr}&rettype=medline&retmode=text`;

                const fetchResponse = await fetch(fetchUrl);
                const fetchText = await fetchResponse.text();
                console.log(fetchText)
                const articles = fetchText.split(/PMID-/);

                displayResults(articles);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <form onSubmit={executeSearch}>
                <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button
                    type="submit"
                >
                    Search
                </button>
            </form>

            <div id="results">

            </div>
        </div>
    )
}

export default PubMedSearch;

interface PubMedSearchProps {

}
