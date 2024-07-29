function navigateTo(path) {
    // Update the content dynamically based on the selected path
    updateContent(path);
}

async function updateContent(path) {
    const contentElement = document.getElementById('content');
    const links = document.querySelectorAll('.sidebar-nav .nav-link');
    links.forEach(link => {
        link.classList.remove('active');
        const onclickAttribute = link.getAttribute('onclick');
        if (onclickAttribute && onclickAttribute.includes(path)) {
            link.classList.add('active');
        }
    });

    try {
        const response = await fetch(path);
        if (response.ok) {
            const html = await response.text();
            contentElement.innerHTML = html;
        } else {
            contentElement.innerHTML = `Error: ${response.status}`;
        }
    } catch (error) {
        contentElement.innerHTML = `Error: ${error.message}`;
    }
}

// Handle the popstate event to detect changes in the browsing history
window.addEventListener("popstate", function(event) {
    // Update the content based on the state object
    const path = window.location.pathname;
    updateContent(path);
});

// Load the initial content based on the current URL
window.addEventListener("DOMContentLoaded", function() {
    const path = window.location.pathname;
    updateContent(path);
});

// Load the initial content based on the current URL or the active item
window.addEventListener("DOMContentLoaded", function() {
    const path = window.location.pathname;
    const activeLink = document.getElementById('active-page');
    if (activeLink) {
        activeLink.click();
    } else {
        navigateTo('/dashboard.html');
    }
});