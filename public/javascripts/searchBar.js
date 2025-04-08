document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('productSearch');
    const resultsContainer = document.querySelector('.autocomplete-results');

    if (!searchInput || !resultsContainer) return;

    searchInput.addEventListener('input', async () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length < 2) {
            resultsContainer.style.display = 'none'; // Hide results if input is too short
            return;
        }

        try {
            const response = await fetch(`/products/search-suggestions?term=${encodeURIComponent(searchTerm)}`);
            const suggestions = await response.json();

            if (suggestions.length) {
                resultsContainer.innerHTML = suggestions
                    .map(suggestion => `<div class="autocomplete-item">${suggestion}</div>`)
                    .join('');
                resultsContainer.style.display = 'block'; // Show dropdown
            } else {
                resultsContainer.style.display = 'none'; // Hide if no results
            }

            // Add click functionality for suggestions
            document.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', () => {
                    searchInput.value = item.textContent;
                    resultsContainer.style.display = 'none';
                });
            });

        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!resultsContainer.contains(e.target) && e.target !== searchInput) {
            resultsContainer.style.display = 'none';
        }
    });
});
