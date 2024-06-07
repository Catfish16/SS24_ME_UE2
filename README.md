# SS24_ME_UE2

## Description

DocSearch is an experimental search/question answering software for medical professionals.

It uses data from PubMed (https://pubmed.ncbi.nlm.nih.gov/) 
maintained by the US National Center for Biotechnology Information. 
The abstracts of the publications yielded by the search API of PubMed
are parsed for the keywords of the search term and displayed sorted by the frequency of keyword occurrence. 

## How to run?

To run the project, you need to follow these steps:
* Ensure Node.js and npm package manager are installed in your computer.
* Clone the project repository from its respective source or download and unzip the package.
* Open Command Prompt and navigate to the project directory location using the 'cd' command.
* Run npm install command. This will install all dependencies needed for the project.
* `npm start`: This command starts the application in development mode. You can open your browser and visit http://localhost:3000 to view the application.

## How to get the best results?

The concept of behind this software is  to pre-process 
abstracts of medical publications to ease the life of medical professionals
by highlighting sentences which include keywords from the search query.
As this is only a prototype there's optimisation missing which would make this a viable solution. 
Adhere to the following guidelines to get the best possible search result from the currents state:

* **Use only keywords**: Don't include filling terms such as "of", "the" etc., as the software matched only words and doesn't consider the relations of them
* **Use double quotation marks " "** around the most relevant terms, only sentences which include these keywords.
* **Set the sensitivity:** The sensitivity setting (by default medium = 50%) determines how many highlighted sentences you get
* **Set the number of results** the PubMed api returns (max is set to 30)

Please also note, that the app is not very dynamic, i.e. if you change a setting you'll have to execute your query again for it to take effect.

_Created by:
Alina Benedek (Catfish16) for SS24 Medizinische Entscheidungsunterstützung @ MedUni Wien_ 
