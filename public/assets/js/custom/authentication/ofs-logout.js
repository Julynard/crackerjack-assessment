document.addEventListener("DOMContentLoaded", function () {
    const logoutLink = document.getElementById("logout-link");
    const signoutLink = document.getElementById("sign-out");

    const handleLogout = function () {
        // Get the token from local storage or wherever you stored it after login
        const token = localStorage.getItem('auth_token');

        if (token) {
            axios.post('/logout', null)
            .then(response => {
                // Handle successful logout here
                console.log(response.data.message);
                // Remove token.
                localStorage.removeItem('auth_token');
                localStorage.removeItem('role');
                // Redirect to login page or perform other actions
                window.location.href = '/';
            })
            .catch(error => {
                console.error('Error Response:', error.response);
                // Handle error here
                console.error(error);
            });
        } else {
            console.log('Token not found. You might be logged out already.');
            // Handle the case where the token is not found (user might be logged out already)
        }
    };

    logoutLink.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link behavior
        handleLogout();
    });

    signoutLink.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link behavior
        handleLogout();
    });
});
