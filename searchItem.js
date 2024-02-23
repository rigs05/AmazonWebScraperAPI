const router = require("express").Router();
const puppeteer = require("puppeteer");

// API Endpoint
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Check for correct Query Prompt
    if (!query) {
      console.log("No queries found");
      return res
        .status(400)
        .json({ message: "please enter correct query parameters." });
    }
    console.log("This is the requested query: " + query);
    await page.goto(`https://amazon.in/s?k=${query}`);

    await page.setViewport({ width: 1080, height: 1920 });

    /* Fetching Top 4 results and returning an Array consisting of 
    Product Name, Description, RatingsCount, Price, and URL */
    const results = await page.evaluate(() => {
      let foundEmptyValue = false;
      let items = [];
      try {
        document.querySelectorAll("[data-asin]").forEach((item) => {
          // Fetch data AFTER first empty instance of ("data-asin")
          const dataValue = item.getAttribute("data-asin");
          if (!foundEmptyValue && dataValue === "") {
            foundEmptyValue = true;
          } else if (foundEmptyValue && dataValue !== "") {
            let Name = item.querySelector("h2").innerText;
            let Description =
              item.querySelector(".a-text-normal")?.innerText || "";
            let Ratings =
              item.querySelector(".a-icon-star-small")?.innerText || "";
            let Price =
              item.querySelector(".a-price").firstChild?.innerText || "";
            let reviewsURL = item.querySelector(
              "a.a-link-normal.a-text-normal"
            ).href;

            items.push({ Name, Description, Ratings, Price, reviewsURL });
          }
        });
        return items.slice(0, 4);
      } catch (error) {
        console.error("Unable to fetch data with query " + query);
        return (items = []);
      }
    });

    // Fetching TotalReviewsCount and Top 10 Reviews on First Page of each Product URL
    const reviewFunction = async (results) => {
      let itemsList = [];
      for (const item of results) {
        try {
          await page.goto(item.reviewsURL);
          await page.waitForSelector("#acrCustomerReviewText");
          const totalRatings = await page.evaluate(() => {
            return (
              document.querySelector("#acrCustomerReviewText")?.innerText || ""
            );
          });

          // Fetching Reviewer's Name, Rating, and Description
          const reviews = await page.evaluate(() => {
            let reviewsList = [];
            document.querySelectorAll(".a-section.review").forEach((review) => {
              let reviewer =
                review.querySelector(".a-profile")?.innerText || "";
              let rating =
                review.querySelector(".review-rating")?.innerText || "";
              let content =
                review.querySelector(".a-size-base.review-text")?.innerText ||
                "";

              reviewsList.push({ reviewer, rating, content });
            });
            return reviewsList.slice(0, 10); // Get top 10 reviews of 1st page only (whichever is earlier)
          });

          itemsList.push({
            Name: item.Name,
            Description: item.Description,
            ProductRatings: item.Ratings,
            Price: item.Price,
            TotalRatings: totalRatings,
            ProductReviews: reviews,
          });
        } catch (err) {
          console.error("Error fetching the reviews for item: " + item.Name);
          console.error(err);
          itemsList.push({
            Name: item.Name,
            Description: item.Description,
            ProductRatings: item.Ratings,
            Price: item.Price,
            totalRatings: "",
            reviews: [],
          });
        }
      }
      return itemsList;
    };

    // Rendering Result and Passing as JSON Response
    const finalData = await reviewFunction(results);

    await res.status(200).json(finalData);

    await browser.close();
  } catch (err) {
    res.status(500).json({ message: "An error occurred" });
    console.log(err);
  }
});

module.exports = router;
