document.addEventListener("DOMContentLoaded", () => {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_ASIN" }, (response) => {
      
      const asinElement = document.getElementById("asin");
      const imageElement = document.getElementById("image");
      const titleElement = document.getElementById("title");
      const priceElement = document.getElementById("price");
      const fbaElement = document.getElementById("fba");
      const soldElement = document.getElementById("sold");
      const categoryElement = document.getElementById("category");
      const brandElement = document.getElementById("brand");

      if (response && response.asin) {
        const fetchData = async () => {
        try {
          const res = await fetch(`https://api.keepa.com/product?domain=1&key=2e327hvqq9m6q1umr6c2onbqr71pguhtum53drsopk60d5a9bdn68tu001fpoban&asin=${response.asin}`);
          const data = await res.json();
          console.log(data.products[0]);
          const result = data.products[0];
          titleElement.textContent = result.title;
          brandElement.textContent = result.brand;
          fbaElement.textContent = parseFloat(result.fbaFees.pickAndPackFee) / 100 + " $"
          soldElement.textContent = result.monthlySold + " +"
          categoryElement.textContent = result.categoryTree[0].name
          asinElement.textContent = response.asin;
      }
      catch (error) {
        console.log(error);
      }
      }
      fetchData();
      }
       else {
        asinElement.textContent = "ASIN not found!";
      }
    });
  });
});
