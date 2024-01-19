document.addEventListener("DOMContentLoaded", function () {
    let username = "johnpapa";
    let currentPage = 1;
    let repositoriesPerPage = 10;
    let totalRepos = 0;
    let searchQuery = "";

    // Initial page load
    fetchAndLoadRepositories(username);

    // Function to fetch and load repositories
    function fetchAndLoadRepositories(username) {
        loadTotalRepositories(username);
        loadRepositories(username, currentPage, repositoriesPerPage);
    }

    // Function to load total repositories count
    function loadTotalRepositories(username) {
        fetch(`https://api.github.com/users/${username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                totalRepos = data.public_repos;
                displayProfile(data);
            })
            .catch(error => {
                console.error("Error fetching total repositories count:", error);
            });
    }

    // Function to load repositories
    function loadRepositories(username, page, perPage) {
        // Show loader
        document.getElementById("loader").style.display = "block";

        // Make API call to GitHub using fetch
        fetch(`https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const linkHeader = response.headers.get('Link');
                const hasNextPage = linkHeader && linkHeader.includes('rel="next"');

                return Promise.all([response.json(), hasNextPage]);
            })
            .then(([data, hasNextPage]) => {
                // Hide loader
                document.getElementById("loader").style.display = "none";

                displayRepositories(data);

                addPagination(username, page, perPage, totalRepos, hasNextPage);
            })
            .catch(error => {
                console.error("Error fetching repositories:", error);
                document.getElementById("loader").style.display = "none";
            });
    }

    // Function to display Profile
    function displayProfile(profile) {
        // Clear previous profile
        document.getElementById("profile").innerHTML = '';

        let profileItem = `
            <div class="profileleft">
                <div class="profileImg">
                    <img src="${profile.avatar_url}" alt="profile image" id="profileImg">
                </div>
                <div class="profileLink">
                    <i class="fa-solid fa-link"></i>
                    <a href="${profile.html_url} target="__blank">${profile.html_url}</a>
                </div>
            </div>
            <div class="profileDesc">
                <h2 id="profileName">${profile.name || 'No Name'}</h2>
                <p id="profileBio">${profile.bio || 'No bio available'}</p>
                <p id="profileLocation"><i class="fa-solid fa-location-dot"></i> ${profile.location || 'Location not specified'}</p>
                <p id="profileEmail"><i class="fa-solid fa-envelope"></i> ${profile.email ? `Email: ${profile.email}` : 'Email not specified'}</p>
            </div>
        `;

        document.getElementById("profile").innerHTML = profileItem;
    }

    // Function to display repositories
    function displayRepositories(repositories) {
        // Clear previous repositories
        document.getElementById("repositories-list").innerHTML = '';

        // Loop through repositories and create HTML elements
        repositories.forEach(function (repo) {
            let repoItem = `<div class="repo-item">
                                <h3>${repo.name}</h3>
                                <p>${repo.description}</p>
                                <span>Language: ${repo.language}</span>
                                <div class="topics">${createTopicTags(repo.topics)}</div>
                            </div>`;
            document.getElementById("repositories-list").innerHTML += repoItem;
        });
    }

    // Function to create topic tags with visual separation
    function createTopicTags(topics) {
        let topicTags = '';

        topics.forEach(function (topic) {
            let tag = `<span class="topic-tag">${topic}</span>`;
            topicTags += tag;
        });

        return topicTags;
    }

    // Function to add pagination
    function addPagination(username, currentPage, perPage, totalRepos, hasNextPage) {
        
        document.getElementById("pagination").innerHTML = '';

        let totalPages = Math.ceil(totalRepos / perPage);

        // Add a "Previous" button if current page is not the first page
        if (currentPage > 1) {
            let prevPageLink = `<a href="#" class="page-link" onclick="goToPage(${currentPage - 1})">Previous</a>`;
            document.getElementById("pagination").innerHTML += prevPageLink;
        }

        // Create pagination links with page numbers
        for (let i = 1; i <= totalPages; i++) {
            let pageLink = `<a href="#" class="page-link ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</a>`;
            document.getElementById("pagination").innerHTML += pageLink;
        }

        // Add a "Next" button if there is a next page
        if (hasNextPage) {
            let nextPageLink = `<a href="#" class="page-link" onclick="goToPage(${currentPage + 1})">Next</a>`;
            document.getElementById("pagination").innerHTML += nextPageLink;
        }
    }

    // Function to search repositories
    window.searchRepositories = function () {
        let searchInput = document.getElementById("repoSearchInput").value.trim();

        document.getElementById("repositories-list").innerHTML = '';

        document.getElementById("loader").style.display = "block";

        fetch(`https://api.github.com/users/${username}/repos?per_page=${totalRepos}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Hide loader
                document.getElementById("loader").style.display = "none";
                
                let filteredRepositories = data.filter(repo =>
                    repo.name.toLowerCase().includes(searchInput.toLowerCase())
                );

            
                displayRepositories(filteredRepositories);
                addPagination(username, currentPage, repositoriesPerPage, filteredRepositories.length, false);
            })
            .catch(error => {
                
                console.error("Error fetching repositories for search:", error);
            });
    };

    // Function to handle changing repositories per page
    window.changePerPage = function () {
        repositoriesPerPage = parseInt(document.getElementById("perPage").value);
        currentPage = 1; 
        loadRepositories(username, currentPage, repositoriesPerPage);
    };

    // Function to handle key press events
    window.handleKeyPressforuser = function (event) {
        if (event.key === "Enter") {
            fetchRepositories();
            document.getElementById("usernameInput").value = "";
        }
    };
    window.handleKeyPressforrepo = function (event) {
        if (event.key === "Enter") {
            searchRepositories();
            document.getElementById("repoSearchInput").value = "";
        }
    };


    // Function to handle clicking on a pagination link
    window.goToPage = function (page) {
        currentPage = page;
        loadRepositories(username, currentPage, repositoriesPerPage);
    };

    // Function to fetch repositories for a specific GitHub username
    window.fetchRepositories = function () {
        let inputUsername = document.getElementById("usernameInput").value.trim();
        if (inputUsername === "") {
            alert("Please enter a GitHub username.");
            return;
        }

        username = inputUsername;
        currentPage = 1;
        fetchAndLoadRepositories(username);
    };
});
