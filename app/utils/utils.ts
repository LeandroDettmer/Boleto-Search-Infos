const utils = {
    hideLoading: () => {
        const loadingContainer = document.getElementById("loading-container");
        if (loadingContainer) {
            const loading = loadingContainer.querySelector(".loading");
            if (loading) {
                loadingContainer.removeChild(loading);
            }
        }
    },

    showLoading: () => {
        const loadingContainerInit = document.getElementById("loading-container");
        if (loadingContainerInit) {
            const loading = loadingContainerInit.querySelector(".loading");
            if (loading) {
                loadingContainerInit.removeChild(loading);
            }
        }

        const loadingContainer = document.getElementById("loading-container");
        if (!loadingContainer) {
            return;
        }

        const loading = document.createElement("div");
        loading.classList.add("loading");

        const label = document.createElement("label");
        label.textContent = "..."; // Coloque aqui o texto do seu loading

        loading.appendChild(label);
        loadingContainer.appendChild(loading);
    },
}

export default utils