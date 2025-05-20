document.addEventListener("DOMContentLoaded", function () {
  // Pricing toggle functionality
  const billingToggle = document.getElementById("billing-toggle");
  const basicPrice = document.getElementById("basic-price");
  const standardPrice = document.getElementById("standard-price");
  const premiumPrice = document.getElementById("premium-price");
  const basicDiscount = document.getElementById("basic-discount");
  const standardDiscount = document.getElementById("standard-discount");
  const premiumDiscount = document.getElementById("premium-discount");
  
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

  // Mobile menu functionality
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileSidebar = document.querySelector('.mobile-sidebar');
  const closeSidebarBtn = document.querySelector('.close-sidebar');
  const overlay = document.querySelector('.overlay');

  function toggleMobileMenu() {
    mobileSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  }

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  closeSidebarBtn.addEventListener('click', toggleMobileMenu);
  overlay.addEventListener('click', toggleMobileMenu);

  // Stop pulse animation after 5 seconds
  setTimeout(function () {
    document.querySelector(".pulse")?.classList.remove("pulse");
  }, 5000);
});