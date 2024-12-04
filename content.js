function createSidebar() {
  const existingSidebar = document.getElementById('amazon-product-sidebar');
  if (existingSidebar) {
    existingSidebar.style.display = 'block';
    return;
  }

  const sidebar = document.createElement('div');
  sidebar.id = 'amazon-product-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    right: 0;
    top: 100px;
    width: 300px;
    max-height: 80vh;
    background: white;
    box-shadow: -2px 0 5px rgba(0,0,0,0.2);
    z-index: 9999;
    padding: 20px;
    overflow-y: auto;
    border-radius: 8px 0 0 8px;
  `;

  sidebar.innerHTML = `
    <div class="box" style="padding-bottom: 20px;">
      <button style="position: sticky; top: 0; right: 10px; cursor: pointer; padding: 5px 10px; float: right;" id="close-button">Close</button>
      <h1 style="margin-top: 30px;">Amazon Products Info</h1>
      <img id="sidebar-image" width="100" height="100" src="" alt="">
      <p><strong>Title:</strong> <span id="sidebar-title">Loading...</span></p>
      <p><strong>ASIN:</strong> <span id="sidebar-asin">Loading...</span></p>  
      <p><strong>Price:</strong> <span id="sidebar-price">Loading...</span></p>
      <p><strong>FBA Fee:</strong> <span id="sidebar-fba">Loading...</span></p>  
      <p><strong>Brand:</strong> <span id="sidebar-brand">Loading...</span></p>
      <p><strong>Monthly Sold:</strong> <span id="sidebar-sold">Loading...</span></p>
      <p><strong>Category:</strong> <span id="sidebar-category">Loading...</span></p>
    </div>
  `;

  document.body.appendChild(sidebar);
  sidebar.querySelector('#close-button').addEventListener('click', () => {
    sidebar.style.display = 'none';
  });
  
  fetchAndDisplayData();
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleSidebar") {
    const sidebar = document.getElementById('amazon-product-sidebar');
    if (sidebar) {
      sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    } else {
      createSidebar();
    }
  }
});

function fetchAndDisplayData() {
  const asin = document.getElementById("ASIN")?.value;
  if (!asin) return;

  fetch(`https://api.keepa.com/product?domain=1&key=2e327hvqq9m6q1umr6c2onbqr71pguhtum53drsopk60d5a9bdn68tu001fpoban&asin=${asin}`)
    .then(res => res.json())
    .then(data => {
      const result = data.products[0];
      document.getElementById("sidebar-title").textContent = result.title;
      document.getElementById("sidebar-brand").textContent = result.brand;
      document.getElementById("sidebar-fba").textContent = parseFloat(result.fbaFees.pickAndPackFee) / 100 + " $";
      document.getElementById("sidebar-sold").textContent = result.monthlySold + " +";
      document.getElementById("sidebar-category").textContent = result.categoryTree[0].name;
      document.getElementById("sidebar-asin").textContent = asin;
    })
    .catch(error => console.error(error));
}


if (window.location.pathname.includes('/dp/')) {
  createSidebar();
}





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