// ===========================
//   User Management Page
// ===========================

const USERS_PAGE_SIZE = 8;

let allUsers = [];
let usersCurrentPage = 1;
let usersCurrentRoleFilter = "all";
let usersCurrentSearchTerm = "";

async function renderUsers() {

    const token = localStorage.getItem("token");

    const res = await fetch(
        `${API_BASE_URL}/users`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const users = await res.json();

    if (!res.ok) {
        showToast("error", "خطا", users.message);
        return;
    }

    allUsers = users;
    usersCurrentPage = 1;
    usersCurrentRoleFilter = "all";
    usersCurrentSearchTerm = "";

    document.getElementById("main-content").innerHTML = `

        <div class="products-header">
            <div class="products-heading">
                <h2>مدیریت کاربران</h2>
                <p>مدیریت تمامی کاربران ثبت شده در سیستم</p>
            </div>
        </div>

        <div class="products-card">

            <div class="products-toolbar">

                <div class="filter-dropdown" id="roleFilterDropdown">
                    <span id="roleFilterLabel">تمامی نقش ها</span>
                    <svg class="dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>

                    <div class="filter-dropdown-menu">
                        <button type="button" data-role="all" class="role-filter-option active">تمامی نقش ها</button>
                        <button type="button" data-role="user" class="role-filter-option">کاربر</button>
                        <button type="button" data-role="admin" class="role-filter-option">ادمین</button>
                    </div>
                </div>

                <div class="search-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        id="userSearch"
                        placeholder="جستجوی کاربر..."
                    >
                </div>

            </div>

            <div class="products-table-wrap">

                <table class="products-table">

                    <thead>
                        <tr>
                            <th>نام کاربر</th>
                            <th>شماره</th>
                            <th>نقش</th>
                            <th>تاریخ عضویت</th>
                            <th>عملیات</th>
                        </tr>
                    </thead>

                    <tbody id="usersTableBody"></tbody>

                </table>

            </div>

            <div class="products-pagination">
                <span id="paginationInfo"></span>
                <div class="pagination-controls">
                    <button class="page-btn" id="prevPageBtn" title="قبلی">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                    <button class="page-btn" id="nextPageBtn" title="بعدی">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

        </div>

    `;

    setupUsersToolbar();
    renderUsersTable();
}

function getFilteredUsers() {

    return allUsers.filter(user => {

        const matchesRole =
            usersCurrentRoleFilter === "all" ||
            user.role === usersCurrentRoleFilter;

        const matchesSearch =
            !usersCurrentSearchTerm ||
            (user.name || "").toLowerCase().includes(usersCurrentSearchTerm);

        return matchesRole && matchesSearch;

    });

}

function renderUsersTable() {

    const filteredUsers = getFilteredUsers();

    const totalRows = filteredUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / USERS_PAGE_SIZE));

    if (usersCurrentPage > totalPages) usersCurrentPage = totalPages;

    const start = (usersCurrentPage - 1) * USERS_PAGE_SIZE;
    const end = start + USERS_PAGE_SIZE;
    const pageUsers = filteredUsers.slice(start, end);

    const tbody = document.getElementById("usersTableBody");

    if (pageUsers.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">کاربری یافت نشد</td>
            </tr>
        `;

    } else {

        tbody.innerHTML = pageUsers.map(user => `

            <tr>

                <td>
                    <div class="product-cell">
                        <div class="user-avatar">${(user.name || "?").charAt(0)}</div>
                        <span class="product-name">${user.name}</span>
                    </div>
                </td>

                <td>${user.phone || "-"}</td>

                <td>
                    <span class="role-text ${user.role}">
                        ${user.role === "admin" ? "ادمین" : "کاربر"}
                    </span>
                </td>

                <td>${new Date(user.createdAt).toLocaleDateString("fa-IR")}</td>

                <td>
                    <div class="table-actions">

                        <button
                            class="delete-btn delete-user-btn"
                            data-id="${user._id}"
                            title="حذف"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                        </button>

                        <button
                            class="edit-role-btn edit-user-btn"
                            data-id="${user._id}"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            تغییر نقش
                        </button>

                    </div>
                </td>

            </tr>

        `).join("");

    }

    document.getElementById("paginationInfo").textContent =
        totalRows === 0
            ? "نمایش 0 از 0 ردیف"
            : `نمایش ${(start + 1).toLocaleString("fa-IR")} تا ${Math.min(end, totalRows).toLocaleString("fa-IR")} از ${totalRows.toLocaleString("fa-IR")} ردیف`;

    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");

    prevBtn.disabled = usersCurrentPage <= 1;
    nextBtn.disabled = usersCurrentPage >= totalPages;

    prevBtn.onclick = () => {
        if (usersCurrentPage > 1) {
            usersCurrentPage--;
            renderUsersTable();
        }
    };

    nextBtn.onclick = () => {
        if (usersCurrentPage < totalPages) {
            usersCurrentPage++;
            renderUsersTable();
        }
    };

    document.querySelectorAll(".delete-user-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            deleteUser(btn.dataset.id);
        });
    });

    document.querySelectorAll(".edit-user-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const user = allUsers.find(u => u._id === id);
            openUserModal(user);
        });
    });

}

function setupUsersToolbar() {

    const userSearch = document.getElementById("userSearch");

    userSearch.addEventListener("input", () => {
        usersCurrentSearchTerm = userSearch.value.toLowerCase().trim();
        usersCurrentPage = 1;
        renderUsersTable();
    });

    const roleFilterDropdown = document.getElementById("roleFilterDropdown");
    const roleFilterLabel = document.getElementById("roleFilterLabel");

    roleFilterDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
        roleFilterDropdown.classList.toggle("open");
    });

    document.querySelectorAll(".role-filter-option").forEach(btn => {
        btn.addEventListener("click", (e) => {

            e.stopPropagation();

            document.querySelectorAll(".role-filter-option").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            usersCurrentRoleFilter = btn.dataset.role;
            roleFilterLabel.textContent = btn.textContent.trim();
            usersCurrentPage = 1;

            roleFilterDropdown.classList.remove("open");
            renderUsersTable();

        });
    });

    document.addEventListener("click", () => {
        roleFilterDropdown.classList.remove("open");
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
                        <strong>شماره:</strong>
                        ${user.phone || "-"}
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
                document.getElementById("userRole").value
            );
        };

}

async function updateUserRole(id, role) {

    const token = localStorage.getItem("token");

    const res = await fetch(
        `${API_BASE_URL}/users/${id}/role`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ role })
        }
    );

    const data = await res.json();

    if (!res.ok) {
        showToast("error", "خطا", data.message);
        return;
    }

    showToast("success", "موفق", "نقش کاربر بروزرسانی شد.");

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
            `${API_BASE_URL}/users/${id}`,
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

        showToast("success", "موفق", "کاربر با موفقیت حذف شد.");

        renderUsers();

    } catch (err) {
        console.error(err);
        showToast("error", "خطا", err.message);
    }

}