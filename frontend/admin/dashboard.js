const token = localStorage.getItem("token");

async function loadDashboard(){

    const headers={
        Authorization:`Bearer ${token}`
    }

    const [products,users,orders]=await Promise.all([

        fetch(`${API_BASE_URL}/products`).then(r=>r.json()),
        fetch(`${API_BASE_URL}/users`,{
            headers
        }).then(r=>r.json()),

        fetch(`${API_BASE_URL}/orders`,{
            headers
        }).then(r=>r.json())

    ]);

    document.getElementById("products-count").textContent=products.length;

    document.getElementById("users-count").textContent=users.length;

    document.getElementById("orders-count").textContent=orders.length;

    let total=0;

    orders.forEach(o=>{

        total+=o.totalPrice;

    })

    document.getElementById("sales-total").textContent=
        total.toLocaleString("fa-IR")+" تومان";

}

loadDashboard();