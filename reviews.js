const puppeteer = require("puppeteer");
const reviewFunction = async (results) => {
  let totalRatings = "";
  let itemsList = [];
  for (const item of results) {
    try {
      //   const browser = await puppeteer.launch();
      const page = await browser.newPage(); // check if required
      await page.goto(item.reviewsURL);
      await page.screenshot({ path: "test.jpg" });
      await page.evaluate(() => {
        totalRatings =
          document.querySelector("#acrCustomerReviewLink")?.innerText || "";
        // console.log(totalRatings);
      });
      const reviews = await page.evaluate(() => {
        let reviewsList = [];
        document.querySelectorAll(".a-section.review").forEach((review) => {
          let reviewer = review.querySelector(".a-profile")?.innerText || "";
          let rating =
            review.querySelector(".a-star-5 .review-rating")?.innerText || "";
          let content =
            review.querySelector(".a-size-base.review-text")?.innerText || "";

          reviewsList.push({ reviewer, rating, content });
        });
        return reviewsList.slice(0, 10); // Get only the top 10 reviews
      });
      itemsList = [item, totalRatings, reviews];
    } catch (err) {
      console.error("Error fetching the reviews for item " + item.name);
      console.error(err);
      itemsList = [item];
    }
  }
  return itemsList;
};

module.exports = { reviewFunction };
