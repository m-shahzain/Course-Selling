// API Base URL
const API_BASE_URL = 'https://course-selling-smoky.vercel.app/';

// Global variables
let currentUser = null;
let currentToken = null;

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const userDashboard = document.getElementById('userDashboard');
const adminDashboard = document.getElementById('adminDashboard');
const loading = document.getElementById('loading');
const quoteContainer = document.getElementById('quoteContainer');

// Event Listeners
loginBtn.addEventListener('click', () => {
    hideQuote();
    showForm('login');
});
signupBtn.addEventListener('click', () => {
    hideQuote();
    showForm('signup');
});
logoutBtn.addEventListener('click', logout);
loginFormElement.addEventListener('submit', handleLogin);
signupFormElement.addEventListener('submit', handleSignup);

// Real-time password validation
document.getElementById('signupPassword').addEventListener('input', function() {
    const password = this.value;
    const passwordFeedback = document.getElementById('passwordFeedback') || createPasswordFeedback();
    
    if (password.length < 6) {
        passwordFeedback.textContent = 'Password must be at least 6 characters';
        passwordFeedback.className = 'error';
        passwordFeedback.style.display = 'block';
    } else {
        passwordFeedback.textContent = 'Password is valid';
        passwordFeedback.className = 'success';
        passwordFeedback.style.display = 'block';
    }
});

function createPasswordFeedback() {
    const feedback = document.createElement('div');
    feedback.id = 'passwordFeedback';
    feedback.style.fontSize = '0.9rem';
    feedback.style.marginTop = '5px';
    
    const passwordField = document.getElementById('signupPassword');
    passwordField.parentNode.appendChild(feedback);
    
    return feedback;
}

// Check if user is already logged in
checkAuthStatus();

// Show/Hide Forms
function showForm(type) {
    hideAllForms();
    if (type === 'login') {
        loginForm.style.display = 'block';
    } else if (type === 'signup') {
        signupForm.style.display = 'block';
    }
}

function hideAllForms() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    userDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
}

// Show Loading
function showLoading() {
    loading.style.display = 'flex';
}

function hideLoading() {
    loading.style.display = 'none';
}

// Show Message
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    document.querySelector('.container').insertBefore(messageDiv, document.querySelector('.container').firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    showLoading();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    try {
        const response = await fetch(`${API_BASE_URL}/signin/${role}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'email': email,
                'password': password
            }
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            currentToken = data.token;
            localStorage.setItem('token', currentToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showMessage('Login successful!');
            hideAllForms();
            
            if (role === 'admin') {
                adminDashboard.style.display = 'block';
                loadAdminDashboard();
            } else {
                userDashboard.style.display = 'block';
                loadUserDashboard();
            }
            
            updateNavButtons();
        } else {
            showMessage(data.err || data.msg || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    // Password validation
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/signup/${role}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Account created successfully! Please login.');
            hideAllForms();
            showForm('login');
        } else {
            showMessage(data.err || 'Signup failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function logout() {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    hideAllForms();
    updateNavButtons();
    showMessage('Logged out successfully!');
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentToken = token;
        currentUser = JSON.parse(user);
        updateNavButtons();
        
        if (currentUser.role === 'admin') {
            adminDashboard.style.display = 'block';
            loadAdminDashboard();
        } else {
            userDashboard.style.display = 'block';
            loadUserDashboard();
        }
    }
}

function updateNavButtons() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        document.getElementById('userName').textContent = currentUser.name;
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

// Admin Dashboard Functions
async function loadAdminDashboard() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/admin/courses`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            const courses = await response.json();
            displayAdminCourses(courses);
        }
    } catch (error) {
        showMessage('Error loading courses', 'error');
    } finally {
        hideLoading();
    }
}

function displayAdminCourses(courses) {
    const adminCoursesDiv = document.getElementById('adminCourses');
    adminCoursesDiv.innerHTML = '';
    
    if (courses.length === 0) {
        adminCoursesDiv.innerHTML = '<p>No courses uploaded yet.</p>';
        return;
    }
    
    courses.forEach(course => {
        const courseCard = createCourseCard(course, true);
        adminCoursesDiv.appendChild(courseCard);
    });
}

// User Dashboard Functions
async function loadUserDashboard() {
    showLoading();
    try {
        // Load available courses
        const availableResponse = await fetch(`${API_BASE_URL}/user/courses`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (availableResponse.ok) {
            const courses = await availableResponse.json();
            displayAvailableCourses(courses);
        }
        
        // Load purchased courses
        const purchasedResponse = await fetch(`${API_BASE_URL}/user/purchased-courses`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (purchasedResponse.ok) {
            const purchasedCourses = await purchasedResponse.json();
            displayPurchasedCourses(purchasedCourses);
        }
    } catch (error) {
        showMessage('Error loading courses', 'error');
    } finally {
        hideLoading();
    }
}

function displayAvailableCourses(courses) {
    const availableCoursesDiv = document.getElementById('availableCourses');
    availableCoursesDiv.innerHTML = '';
    
    if (courses.length === 0) {
        availableCoursesDiv.innerHTML = '<p>No courses available.</p>';
        return;
    }
    
    courses.forEach(course => {
        const courseCard = createCourseCard(course, false);
        availableCoursesDiv.appendChild(courseCard);
    });
}

function displayPurchasedCourses(courses) {
    const purchasedCoursesDiv = document.getElementById('purchasedCourses');
    purchasedCoursesDiv.innerHTML = '';
    
    if (courses.length === 0) {
        purchasedCoursesDiv.innerHTML = '<p>No purchased courses yet.</p>';
        return;
    }
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        
        const purchaseDate = new Date(course.purchaseDate).toLocaleDateString();
        
        courseCard.innerHTML = `
            <h3 class="course-title">${course.name}</h3>
            <div class="course-description">Purchased on: ${purchaseDate}</div>
        `;
        
        purchasedCoursesDiv.appendChild(courseCard);
    });
}

// Course Card Creation
function createCourseCard(course, isAdmin = false, isPurchased = false) {
    const card = document.createElement('div');
    card.className = 'course-card';
    
    const imageUrl = course.imageurl || 'https://via.placeholder.com/300x200?text=Course+Image';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${course.name}" class="course-image">
        <h3 class="course-title">${course.name}</h3>
        <div class="course-price">$${course.price}</div>
        <p class="course-description">${course.description || 'No description available.'}</p>
        <div class="course-actions">
            ${isAdmin ? 
                `<button class="btn btn-danger" onclick="deleteCourse('${course._id}')">Delete</button>` :
                isPurchased ? 
                    `<button class="btn btn-primary" onclick="viewCourse('${course._id}')">View Course</button>` :
                    `<button class="btn btn-success" onclick="purchaseCourse('${course._id}')">Purchase</button>`
            }
        </div>
    `;
    
    return card;
}

// Course Actions
async function purchaseCourse(courseId) {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/user/purchase-course`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ courseId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Course purchased successfully!');
            loadUserDashboard(); // Refresh the dashboard
        } else {
            showMessage(data.error || 'Purchase failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    showLoading();
    try {
        console.log('Deleting course with ID:', courseId);
        
        const response = await fetch(`${API_BASE_URL}/admin/delete-course`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ courseId })
        });
        
        const data = await response.json();
        console.log('Delete response:', data);
        
        if (response.ok) {
            showMessage('Course deleted successfully!');
            loadAdminDashboard(); // Refresh the dashboard
        } else {
            showMessage(data.msg || data.error || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function viewCourse(courseId) {
    showMessage('Course viewing feature coming soon!');
}

// Course Upload (Admin)
document.getElementById('courseUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Upload form submitted!'); // Debug log
    showLoading();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('courseName').value);
    formData.append('price', document.getElementById('coursePrice').value);
    formData.append('description', document.getElementById('courseDescription').value);
    
    const imageFile = document.getElementById('courseImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/courses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Course uploaded successfully!');
            document.getElementById('courseUploadForm').reset();
            loadAdminDashboard(); // Refresh the dashboard
        } else {
            showMessage(data.msg || data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showMessage('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
});

function hideQuote() {
    if (quoteContainer) {
        quoteContainer.style.display = 'none';
    }
}