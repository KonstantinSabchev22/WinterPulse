document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('productSearch');
    const resultsContainer = document.querySelector('.autocomplete-results');

    if (!searchInput || !resultsContainer) return; // Prevents errors if elements are missing

    searchInput.addEventListener('input', async () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/products/search-suggestions?term=${encodeURIComponent(searchTerm)}`);
            const suggestions = await response.json();

            resultsContainer.innerHTML = suggestions
                .map(suggestion => `<div class="autocomplete-item">${suggestion}</div>`)
                .join('');

            document.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', () => {
                    searchInput.value = item.textContent;
                    resultsContainer.innerHTML = '';
                });
            });

        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    });

    document.addEventListener('click', (e) => {
        if (!resultsContainer.contains(e.target) && e.target !== searchInput) {
            resultsContainer.innerHTML = '';
        }
    });
});
