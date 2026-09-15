// localStorage.removeItem("cart");
if (new URLSearchParams(location.search).get("orderId")) {
    localStorage.removeItem("cart");
}

const params = new URLSearchParams(window.location.search);

const refId = params.get("refId");

const refElement = document.getElementById("refId");

if (refId) {
    refElement.innerHTML = `
        <span>شماره پیگیری :</span>
        <strong>${refId}</strong>
    `;
} else {
    refElement.style.display = "none";
}