async function renderUsers() {


    const token = localStorage.getItem("token");

    const res = await fetch(
        "https://shop-sanitary-production.up.railway.app/api/users",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const users = await res.json();

    if (!res.ok) {
        alert(users.message);
        return;
    }

    document.getElementById("main-content").innerHTML = `

 <div class="products-header">

    <h2>مدیریت کاربران</h2>

    <div class="products-actions">

        <input
            type="text"
            id="userSearch"
            placeholder="جستجوی کاربر..."
        >

    </div>

</div>

        <table class="products-table">

            <thead>

                <tr>

                    <th>نام</th>
                    <th>ایمیل</th>
                    <th>نقش</th>
                    <th>تاریخ عضویت</th>
                    <th>عملیات</th>

                </tr>

            </thead>

            <tbody>

                ${users.map(user => `

                    <tr>

                        <td>${user.name}</td>

                        <td>${user.email}</td>

                        <td>

                            <span class="role-badge ${user.role}">

                                ${user.role === "admin"
            ? "ادمین"
            : "کاربر"}

                            </span>

                        </td>

                        <td>

                            ${new Date(user.createdAt).toLocaleDateString("fa-IR")}

                        </td>

                        <td>

                            <button
                                class="edit-user-btn"
                                data-id="${user._id}"
                            >

                                ویرایش

                            </button>

                            <button
                                class="delete-user-btn"
                                data-id="${user._id}"
                            >

                                حذف

                            </button>

                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

    `;
    const userSearch = document.getElementById("userSearch");

    userSearch.addEventListener("input", () => {

        const keyword = userSearch.value.toLowerCase().trim();

        document.querySelectorAll(".products-table tbody tr").forEach(row => {

            const userName = row.children[1].innerText.toLowerCase();

            row.style.display = userName.includes(keyword)
                ? ""
                : "none";

        });

    });

    document.querySelectorAll(".edit-user-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const id = btn.dataset.id;

            const user = users.find(u => u._id === id);

            openUserModal(user);

        });

    });
    document.querySelectorAll(".delete-user-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            deleteUser(btn.dataset.id);

        });

    });

}


function openUserModal(user) {

    document.body.insertAdjacentHTML(

        "beforeend",

        `

        <div class="modal-overlay user-modal-overlay">

            <div class="product-modal">

                <div class="modal-header">

                    <h2>

                        ویرایش کاربر

                    </h2>

                    <button class="close-user-modal">

                        ✕

                    </button>

                </div>


                <div class="order-info">

                    <p>

                        <strong>نام:</strong>

                        ${user.name}

                    </p>

                    <p>

                        <strong>ایمیل:</strong>

                        ${user.email}

                    </p>

                </div>


                <div class="status-box">

                    <label>

                        نقش

                    </label>

                    <select id="userRole">

                        <option
                            value="user"
                            ${user.role === "user" ? "selected" : ""}
                        >

                            کاربر

                        </option>


                        <option
                            value="admin"
                            ${user.role === "admin" ? "selected" : ""}
                        >

                            ادمین

                        </option>

                    </select>


                    <button
                        class="save-user-role"
                        data-id="${user._id}"
                    >

                        ذخیره

                    </button>

                </div>

            </div>

        </div>

        `
    );



    document
        .querySelector(".close-user-modal")
        .onclick = () => {

            document
                .querySelector(".user-modal-overlay")
                .remove();

        };



    document
        .querySelector(".save-user-role")
        .onclick = () => {

            updateUserRole(

                user._id,

                document
                    .getElementById("userRole")
                    .value

            );

        };

}

async function updateUserRole(id, role) {

    const token = localStorage.getItem("token");

    const res = await fetch(

        `https://shop-sanitary-production.up.railway.app/api/users/${id}/role`,

        {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`

            },

            body: JSON.stringify({

                role

            })

        }

    );



    const data = await res.json();



    if (!res.ok) {

        alert(data.message);

        return;

    }



    alert("✅ نقش کاربر بروزرسانی شد.");


    document
        .querySelector(".user-modal-overlay")
        .remove();


    renderUsers();

}


async function deleteUser(id) {

    const confirmDelete = confirm(
        "آیا از حذف این کاربر مطمئن هستید؟"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {

        const res = await fetch(

            `https://shop-sanitary-production.up.railway.app/api/users/${id}`,

            {

                method: "DELETE",

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        const data = await res.json();

        if (!res.ok) {

            throw new Error(data.message);

        }

        alert("✅ کاربر با موفقیت حذف شد.");

        renderUsers();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}