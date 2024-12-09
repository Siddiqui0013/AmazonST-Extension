// async function createSidebar() {
//   const existingSidebar = document.getElementById('amazon-product-sidebar');
//   if (existingSidebar) {
//     existingSidebar.style.display = existingSidebar.style.display === 'none' ? 'block' : 'none';
//     return;
//   }

//   try {
//     const response = await fetch(chrome.runtime.getURL('sidebar.html'));
//     const html = await response.text();

//     const sidebar = document.createElement('div');
//     sidebar.id = 'amazon-product-sidebar';
//     sidebar.innerHTML = html
//     document.body.appendChild(sidebar)

//     sidebar.querySelector('#close-button').addEventListener('click', () => {
//       sidebar.style.display = 'none';
//     });

//     fetchAndDisplayData();
//   } catch (error) {
//     console.error('Error loading sidebar:', error);
//   }
// }

// const productPage = document.getElementById('product-insights');
// const sellerPage = document.getElementById('seller-insights');

// sellerPage.style.display = 'none';

async function createSidebar() {
  const existingSidebar = document.getElementById('amazon-product-sidebar');
  if (existingSidebar) {
    existingSidebar.style.display = existingSidebar.style.display === 'none' ? 'block' : 'none';
    return;
  }

  try {
    const response = await fetch(chrome.runtime.getURL('sidebar.html'));
    const html = await response.text();

    const sidebar = document.createElement('div');
    sidebar.id = 'amazon-product-sidebar';
    sidebar.innerHTML = html;
    document.body.appendChild(sidebar);

    const productButton = sidebar.querySelector('#product-btn');
    const sellerButton = sidebar.querySelector('#seller-btn');
    const productSection = sidebar.querySelector('#product-insights');
    const sellerSection = sidebar.querySelector('#seller-insights');

    productButton.addEventListener('click', () => {
      productButton.classList.add('active');
      sellerButton.classList.remove('active');
      productSection.style.display = 'block';
      sellerSection.style.display = 'none';
    });

    sellerButton.addEventListener('click', () => {
      sellerButton.classList.add('active');
      productButton.classList.remove('active');
      productSection.style.display = 'none';
      sellerSection.style.display = 'block';
    });

    sidebar.querySelector('#close-button').addEventListener('click', () => {
      sidebar.style.display = 'none';
    });

    fetchAndDisplayData();
  } catch (error) {
    console.error('Error loading sidebar:', error);
  }
}



function getAmazonProductData() {

  const priceSelectors = [
    'span.a-price span[aria-hidden="true"]',
    '.a-price .a-price-whole',
    '#priceblock_ourprice',
    '.price3P',
    '#price_inside_buybox',
    '[data-price-type="finalPrice"]',
  ];
  let price = null;
  for (const selector of priceSelectors) {
    const priceElement = document.querySelector(selector);
    if (priceElement?.textContent) {
      price = priceElement.textContent.trim();
      console.log('Price found:', price, 'using selector:', selector);
      break;
    }
  }

  const imageSelectors = [
    '#landingImage',
    '#imgBlkFront',
    '#ebooksImgBlkFront',
    '.a-dynamic-image',
];
let mainImage = null;
for (const selector of imageSelectors) {
    const imgElement = document.querySelector(selector);
    if (imgElement?.src) {
        mainImage = imgElement.src;
        break;
    }
}

let fulfillmentType = ""

// if (document.getElementById("sellerProfileTriggerId") ) {
//     fulfillmentType = 'FBA';
// } else {
//     fulfillmentType = 'FBM';
// }

  // fulfillmentType = document.getElementById("sellerProfileTriggerId").textContent

if ( document.getElementById("sellerProfileTriggerId") ) {
    fulfillmentType = 'FBM';
} else {
    fulfillmentType = 'FBA';
}




let lowestFBA = null;
let lowestFBM = null;
const offerListElement = document.querySelector('#aod-offer-list');
if (offerListElement) {
    const offers = offerListElement.querySelectorAll('.aod-information-block');
    offers.forEach(offer => {
        const price = offer.querySelector('.a-price .a-offscreen')?.textContent;
        const isFBA = offer.querySelector('.prime-shipping-message');
        if (price) {
            if (isFBA && (!lowestFBA || parseFloat(price) < parseFloat(lowestFBA))) {
                lowestFBA = price;
            } else if (!isFBA && (!lowestFBM || parseFloat(price) < parseFloat(lowestFBM))) {
                lowestFBM = price;
            }
        }
    });
}


let buyboxSeller = null;
const buyboxSellerElement = document.querySelector('#merchant-info');
if (buyboxSellerElement) {
    buyboxSeller = buyboxSellerElement.textContent.trim();
}


  let asin = document.getElementById("ASIN")?.value;
  if (!asin) {
    const urlMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
    asin = urlMatch ? urlMatch[1] : null;
  }

  const data = {
    asin,
    merchantId: document.getElementById("merchantID")?.value,
    sessionId: document.getElementById("session-id")?.value,
    marketplace: document.querySelector("[name='marketplace']")?.value,
    parentAsin: document.querySelector("[name='parentAsin']")?.value,
    price,
    mainImage,
    fulfillmentType,
    lowestFBA,
    lowestFBM,
    buyboxSeller
  };

let productDetails = {};

const rows = document.querySelectorAll('tr');
rows.forEach(row => {
  const label = row.querySelector('th')?.textContent.trim();
  const value = row.querySelector('td')?.textContent.trim();
  
  if (label && value) {
    switch(label) {
      case 'Product Dimensions':
        productDetails.dimensions = value;
        break;
      case 'Item Weight':
        productDetails.weight = value;
        break;
      case 'Item model number':
        productDetails.modelNumber = value;
        break;
      case 'Best Sellers Rank':
        productDetails.bsr = value;
        break;
      case 'Date First Available':
        productDetails.dateAvailable = value;
        break;
      case 'Country of Origin':
        productDetails.country = value;
        break;
    }
  }
});

return {
  ...data,
  productDetails
}}
function fetchAndDisplayData() {

  const productData = getAmazonProductData();
    const chartImg = `https://api.keepa.com/graphimage?key=2e327hvqq9m6q1umr6c2onbqr71pguhtum53drsopk60d5a9bdn68tu001fpoban&domain=1&width=350&height=250&asin=${productData.asin}`;
    document.getElementById("keepa-chart").src = chartImg;

    if (!productData.asin) {
      console.error('No ASIN found');
      return;
    }

    document.getElementById("sidebar-image").src = productData.mainImage;
    document.getElementById("sidebar-asin").textContent = productData.asin || "Not found";
    document.getElementById("sidebar-merchant").textContent = productData.merchantId || "Not found";
    document.getElementById("sidebar-price").textContent = productData.price || "Not found";
    document.getElementById("sidebar-fulfillment").textContent = productData.fulfillmentType || "Not available";
    document.getElementById("sidebar-buybox").textContent = productData.buyboxSeller || "Not available";

    if (productData.productDetails) {

      function formatBSR(bsr) {
        return bsr.split('\n')
          .map(line => {
            line = line.replace(/\([^)]*\)/g, '').trim();
                  if (!line.startsWith('#')) {
              line = line.replace(/#/g, ' #');
            }
            return line;
          })
          .join('\n');
      }

      const bsr = productData.productDetails.bsr
      const formattedBSR = formatBSR(bsr);

      document.getElementById("sidebar-dimensions").textContent = productData.productDetails.dimensions || "N/A";
      document.getElementById("sidebar-weight").textContent = productData.productDetails.weight || "N/A";
      document.getElementById("sidebar-model").textContent = productData.productDetails.modelNumber || "N/A";
      document.getElementById("sidebar-bsr").textContent = formattedBSR || "N/A";
    }

    fetch(`https://api.keepa.com/product?domain=1&key=2e327hvqq9m6q1umr6c2onbqr71pguhtum53drsopk60d5a9bdn68tu001fpoban&asin=${productData.asin}`)
      .then((res) => res.json())
      .then((data) => {
        const result = data.products[0];
        if (result) {
          const titleExract = result.title;
          const titleShort = titleExract.split(",")[0] || titleExract.split("-")[0];
          document.getElementById("sidebar-title").textContent = titleShort || "Not available";
          document.getElementById("sidebar-brand").textContent = result.brand || "Not available";
          document.getElementById("sidebar-fba").textContent = parseFloat(result.fbaFees.pickAndPackFee) / 100 + " $";
          document.getElementById("sidebar-sold").textContent = result.monthlySold ? result.monthlySold + " +" : "Not available";
          document.getElementById("sidebar-category").textContent = result.categoryTree?.[0]?.name || "Not available";
          document.getElementById("sidebar-variations").textContent = result.variations?.length || "Not available";
        } else {
          console.error('No product data found from Keepa API');
        }
      })
      .catch((error) => {
        console.error('Keepa API error:', error);
      });
}



chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleSidebar") {
    createSidebar();
  }
});

if (window.location.pathname.includes('/dp/')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSidebar);
  } else {
    createSidebar();
  }
}










// async function createSidebar() {
//   const existingSidebar = document.getElementById('amazon-product-sidebar');
//   if (existingSidebar) {
//     existingSidebar.style.display = existingSidebar.style.display === 'none' ? 'block' : 'none';
//     return;
//   }

//   try {
//     const response = await fetch(chrome.runtime.getURL('sidebar.html'));
//     const html = await response.text();

//     const sidebar = document.createElement('div');
//     sidebar.id = 'amazon-product-sidebar';
//     sidebar.innerHTML = html;
//     document.body.appendChild(sidebar);

//     sidebar.querySelector('#close-button').addEventListener('click', () => {
//       sidebar.style.display = 'none';
//     });

//     fetchAndDisplayData();
//   } catch (error) {
//     console.error('Error loading sidebar:', error);
//   }
// }

// function getAmazonProductData() {
//   const priceSelectors = [
//     'span.a-price span[aria-hidden="true"]',  
//     '.a-price .a-price-whole',                
//     '#priceblock_ourprice',
//     '.price3P',
//     '#price_inside_buybox',
//     '[data-price-type="finalPrice"]'
//   ];

//   let price = null;
//   for (const selector of priceSelectors) {
//     const priceElement = document.querySelector(selector);
//     if (priceElement?.textContent) {
//       price = priceElement.textContent.trim();
//       console.log('Price found:', price, 'using selector:', selector);
//       break;
//     }
//   }
//   let asin = document.getElementById("ASIN")?.value;
//   if (!asin) {
//     const urlMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
//     asin = urlMatch ? urlMatch[1] : null;
//   }

//   const data = {
//     asin: asin,
//     merchantId: document.getElementById("merchantID")?.value,
//     sessionId: document.getElementById("session-id")?.value,
//     marketplace: document.querySelector("[name='marketplace']")?.value,
//     parentAsin: document.querySelector("[name='parentAsin']")?.value,
//     price: price
//   };

//   console.log('Collected product data:', data); 
//   return data;
// }

// function fetchAndDisplayData() {
//   const productData = getAmazonProductData();
//   console.log('Product data:', productData);
//   if (!productData.asin) {
//     console.error('No ASIN found');
//     return;
//   }
//   if (productData.asin) document.getElementById("sidebar-asin").textContent = productData.asin;
//   if (productData.merchantId) document.getElementById("sidebar-merchant").textContent = productData.merchantId;
//   if (productData.price) document.getElementById("sidebar-price").textContent = productData.price;

//   fetch(`https://api.keepa.com/product?domain=1&key=2e327hvqq9m6q1umr6c2onbqr71pguhtum53drsopk60d5a9bdn68tu001fpoban&asin=${productData.asin}`)
//     .then(res => res.json())
//     .then(data => {
//       const result = data.products[0];
//       document.getElementById("sidebar-title").textContent = result.title;
//       document.getElementById("sidebar-brand").textContent = result.brand;
//       document.getElementById("sidebar-fba").textContent = parseFloat(result.fbaFees.pickAndPackFee) / 100 + " $";
//       document.getElementById("sidebar-sold").textContent = result.monthlySold + " +";
//       document.getElementById("sidebar-category").textContent = result.categoryTree[0].name;
//     })
//     .catch(error => {
//       console.error('Keepa API error:', error);
//     });
// }

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "toggleSidebar") {
//     createSidebar();
//   }
// });

// if (window.location.pathname.includes('/dp/')) {
//   createSidebar();
// }







// async function createSidebar() {
//   try {
//     const response = await fetch(chrome.runtime.getURL('sidebar.html'));
//     const html = await response.text();

//     const sidebar = document.createElement('div');
//     sidebar.id = 'amazon-product-sidebar';
//     sidebar.innerHTML = html;
//     document.body.appendChild(sidebar);

//     const sidebarElement = document.getElementById('amazon-product-sidebar');
//     if (sidebarElement) {
//       console.log('Sidebar created');
//       fetchAndDisplayData();
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// function extractASIN() {
//   const urlMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
//   if (urlMatch) return urlMatch[1];
  
//   const asinElement = document.getElementById("ASIN");
//   if (asinElement?.value) return asinElement.value;
  
//   const productElement = document.querySelector('[data-asin]');
//   if (productElement?.dataset.asin) return productElement.dataset.asin;
  
//   return null;
// }

// function getAmazonProductData() {

//   const asin = extractASIN();

//   const imageSelectors = [
//     '#landingImage',                // Main product image
//     '#imgBlkFront',                // Book cover image
//     '#ebooksImgBlkFront',          // Kindle book image
//     '.a-dynamic-image',            // Dynamic image
// ];
// let mainImage = null;
// for (const selector of imageSelectors) {
//     const imgElement = document.querySelector(selector);
//     if (imgElement?.src) {
//         mainImage = imgElement.src;
//         break;
//     }
// }

// let bsr = null;
// const bsrElement = document.querySelector('#productDetails_detailBullets_sections1 tr:has(th:contains("Best Sellers Rank"))');
// if (bsrElement) {
//     const bsrText = bsrElement.textContent;
//     const bsrMatch = bsrText.match(/#([0-9,]+)/);
//     bsr = bsrMatch ? bsrMatch[1] : null;
// }

// let fulfillmentType = 'Unknown';
// if (document.querySelector('.sns-shipping-message') || document.querySelector('.prime-shipping-message')) {
//     fulfillmentType = 'FBA';
// } else if (document.querySelector('.merchant-shipping-message')) {
//     fulfillmentType = 'FBM';
// }

// let lowestFBA = null;
// let lowestFBM = null;
// const offerListElement = document.querySelector('#aod-offer-list');
// if (offerListElement) {
//     const offers = offerListElement.querySelectorAll('.aod-information-block');
//     offers.forEach(offer => {
//         const price = offer.querySelector('.a-price .a-offscreen')?.textContent;
//         const isFBA = offer.querySelector('.prime-shipping-message');
//         if (price) {
//             if (isFBA && (!lowestFBA || parseFloat(price) < parseFloat(lowestFBA))) {
//                 lowestFBA = price;
//             } else if (!isFBA && (!lowestFBM || parseFloat(price) < parseFloat(lowestFBM))) {
//                 lowestFBM = price;
//             }
//         }
//     });
// }

// let variationsCount = 0;
// const variationElement = document.querySelector('#variation_size_name') || document.querySelector('#variation_color_name');
// if (variationElement) {
//     variationsCount = variationElement.querySelectorAll('option, li').length;
// }

// let buyboxSeller = null;
// const buyboxSellerElement = document.querySelector('#merchant-info');
// if (buyboxSellerElement) {
//     buyboxSeller = buyboxSellerElement.textContent.trim();
// }

// const priceSelectors = [
// 'span.a-price span[aria-hidden="true"]',  
//     'span.a-price .a-offscreen',              
//     '.a-price .a-price-whole',               
//     '#corePrice_feature_div .a-price',   
//     '#priceblock_ourprice',
//     '.price3P',
//     '#price_inside_buybox',
//     '[data-price-type="finalPrice"]'      
// ];
// // let price =  document.querySelector('span.a-price span[aria-hidden="true"]')?.textContent;
// let price = null;
// for (const selector of priceSelectors) {
//     const priceElement = document.querySelector(selector);
//     if (priceElement?.textContent) {
//         price = priceElement.textContent.trim();
//         break;
//     }
// }


// return {
//   asin,
//   mainImage,
//   price,
//   bsr,
//   fulfillmentType,
//   lowestFBA,
//   lowestFBM,
//   variationsCount,
//   buyboxSeller,
//   merchantId: document.getElementById("merchantID")?.value,
//   marketplace: document.querySelector("[name='marketplace']")?.value,
//   parentAsin: document.querySelector("[name='parentAsin']")?.value
// };
// }

// function fetchAndDisplayData() {
//   debugger; 
//   const productData = getAmazonProductData()
//   console.log('Product Data:', productData);

//   document.getElementById("sidebar-asin").textContent = " fck Not found";
//   document.getElementById("sidebar-merchant").textContent = "fck Merchant found";
//   document.getElementById("sidebar-price").textContent = "fck Price"
//   // document.getElementById("sidebar-asin").textContent = productData.asin || "Not found";
//   // document.getElementById("sidebar-merchant").textContent = productData.merchantId || "Not found";
//   // document.getElementById("sidebar-price").textContent = productData.price || "Not found";
//   document.getElementById("sidebar-image").src = productData.mainImage || "https://via.placeholder.com/150";
//   document.getElementById("sidebar-bsr").textContent = productData.bsr || "Not found";
//   document.getElementById("sidebar-fulfillment").textContent = productData.fulfillmentType || "Not found";
//   document.getElementById("sidebar-lowest-fba").textContent = productData.lowestFBA || "Not found";
//   document.getElementById("sidebar-lowest-fbm").textContent = productData.lowestFBM || "Not found";
//   document.getElementById("sidebar-variations").textContent = productData.variationsCount || "Not found";
//   document.getElementById("sidebar-buybox").textContent = productData.buyboxSeller || "Not found";

//   fetch(`https://api.keepa.com/product?domain=1&key=2e327hvqq9m6q1umr6c2onbqr71pguhtum53drsopk60d5a9bdn68tu001fpoban&asin=${productData.asin}`)
//     .then(res => res.json())
//     .then(data => {
//       const result = data.products[0];
//       document.getElementById("sidebar-title").textContent = result.title;
//       document.getElementById("sidebar-brand").textContent = result.brand;
//       document.getElementById("sidebar-fba").textContent = parseFloat(result.fbaFees.pickAndPackFee) / 100 + " $";
//       document.getElementById("sidebar-sold").textContent = result.monthlySold + " +";
//       document.getElementById("sidebar-category").textContent = result.categoryTree[0].name;
//     })
//     .catch(console.error);
// }

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "toggleSidebar") {
//     createSidebar();
//   }
// });

// if (window.location.pathname.includes('/dp/')) {
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', createSidebar);
//   } else {
//     createSidebar();
//   }
// }



// function createSidebar() {
//   const sidebar = document.createElement('div');
//   sidebar.id = 'amazon-product-sidebar';
//   sidebar.style.cssText = `
//     position: fixed;
//     right: 0;
//     top: 100px;
//     width: 300px;
//     min-height: 70vh;
//     background: white;
//     box-shadow: -2px 0 5px rgba(0,0,0,0.2);
//     z-index: 9999;
//     padding: 20px;
//     overflow-y: scroll;
//   `;

//   sidebar.innerHTML = `
//     <div class="box">
//       <button style="position: absolute; top: 10px; right: 10px; cursor: pointer; padding: 5px 10px;" id="close-button">Close</button>
//       <h1>Amazon Products Info</h1>
//       <img id="sidebar-image" width="100" height="100" src="" alt="">
//       <p><strong>Title:</strong> <span id="sidebar-title">Loading...</span></p>
//       <p><strong>ASIN:</strong> <span id="sidebar-asin">Loading...</span></p>  
//       <p><strong>Price:</strong> <span id="sidebar-price">Loading...</span></p>
//       <p><strong>FBA Fee:</strong> <span id="sidebar-fba">Loading...</span></p>  
//       <p><strong>Brand:</strong> <span id="sidebar-brand">Loading...</span></p>
//       <p><strong>Monthly Sold:</strong> <span id="sidebar-sold">Loading...</span></p>
//       <p><strong>Category:</strong> <span id="sidebar-category">Loading...</span></p>
//     </div>
//   `;

//   document.body.appendChild(sidebar);
//   fetchAndDisplayData();
// }

// // document.getElementById('close-button').addEventListener('click', () => {
// //   const sidebar = document.getElementById('amazon-product-sidebar');
// //   sidebar.remove();
// // });

// function fetchAndDisplayData() {
//   const asin = document.getElementById("ASIN")?.value;
//   if (!asin) return;

//   fetch(`https://api.keepa.com/product?domain=1&key=2e327hvqq9m6q1umr6c2onbqr71pguhtum53drsopk60d5a9bdn68tu001fpoban&asin=${asin}`)
//     .then(res => res.json())
//     .then(data => {
//       const result = data.products[0];
//       document.getElementById("sidebar-title").textContent = result.title;
//       document.getElementById("sidebar-brand").textContent = result.brand;
//       document.getElementById("sidebar-fba").textContent = parseFloat(result.fbaFees.pickAndPackFee) / 100 + " $";
//       document.getElementById("sidebar-sold").textContent = result.monthlySold + " +";
//       document.getElementById("sidebar-category").textContent = result.categoryTree[0].name;
//       document.getElementById("sidebar-asin").textContent = asin;
//     })
//     .catch(error => console.error(error));
// }

// if (window.location.pathname.includes('/dp/')) {
//   createSidebar();
// }

// const closeButton = document.getElementById('close-button');
// closeButton.addEventListener('click', () => {
//   const sidebar = document.getElementById('amazon-product-sidebar');
//   // sidebar.remove();
//   sidebar.style.display = 'none';
// });