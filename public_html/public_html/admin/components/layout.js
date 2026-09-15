header.innerHTML = `

<button id="homeBtn" class="home-btn">
    بازگشت به خونه
</button>
`;
document.getElementById("homeBtn").addEventListener("click", () => {
    window.location.href = "../index.html";
});