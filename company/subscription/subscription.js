document.addEventListener("DOMContentLoaded", function () {
    const billingToggle = document.getElementById("billing-toggle");
    const basicPrice = document.getElementById("basic-price");
    const standardPrice = document.getElementById("standard-price");
    const premiumPrice = document.getElementById("premium-price");
    const basicDiscount = document.getElementById("basic-discount");
    const standardDiscount = document.getElementById("standard-discount");
    const premiumDiscount = document.getElementById("premium-discount");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenuClose = document.getElementById("mobile-menu-close");
    const mobileMenu = document.getElementById("mobile-menu");
  
    const monthlyPrices = {
      basic: "ETB 499",
      standard: "ETB 999",
      premium: "ETB 1,999",
    };
  
    const annualPrices = {
      basic: "ETB 399",
      standard: "ETB 799",
      premium: "ETB 1,599",
    };
  
    billingToggle.addEventListener("change", function () {
      if (this.checked) {
        // Annual pricing
        basicPrice.textContent = annualPrices.basic;
        standardPrice.textContent = annualPrices.standard;
        premiumPrice.textContent = annualPrices.premium;
        basicDiscount.classList.remove("hidden");
        standardDiscount.classList.remove("hidden");
        premiumDiscount.classList.remove("hidden");
      } else {
        // Monthly pricing
        basicPrice.textContent = monthlyPrices.basic;
        standardPrice.textContent = monthlyPrices.standard;
        premiumPrice.textContent = monthlyPrices.premium;
        basicDiscount.classList.add("hidden");
        standardDiscount.classList.add("hidden");
        premiumDiscount.classList.add("hidden");
      }
    });
  
    // Mobile menu toggle
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("mobile-menu-hidden");
    });
  
    mobileMenuClose.addEventListener("click", () => {
      mobileMenu.classList.add("mobile-menu-hidden");
    });
  
    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.add("mobile-menu-hidden");
      }
    });
  
    // Stop pulse animation after 5 seconds
    setTimeout(function () {
      document.querySelector(".pulse").classList.remove("pulse");
    }, 5000);
  });