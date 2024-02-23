Product Web Scraping on AMAZON.IN website:

In order to run this Web Scraping API ->

1. Clone the repository (git clone URL)
   {ENSURE THAT THE PWD IS IN THE API FOLDER}
2. Install the package.json instance (npm install)
3. Run the app.js file directly (node app.js)
   OR
   Install nodemon (npm i nodemon) => (nodemon app.js)
4. Using POSTMAN OR Web Browser, goto localhost:3000/search?query=**enter*your_query_here***
5. POSTMAN will directly display the Top 4 Products along with its details:
   Name,
   Description,
   Overall Ratings (Stars out of 5),
   Price,
   Total No. of Ratings (Overall Review Count),
   Each Product's Top 10 Ratings (Reviewer's Name, Ratings by him, Description)
