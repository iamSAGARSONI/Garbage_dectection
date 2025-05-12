document.addEventListener('DOMContentLoaded', () => {
    const pdfs = [
        {
            title: "Waste Classification Guide",
            description: "Comprehensive guide to modern waste categorization and recycling practices.",
            url: "path/to/waste-guide.pdf",
            icon: "file-pdf"
        },
        {
            title: "Environmental Impact Report",
            description: "2023 Global environmental impact analysis and sustainability strategies.",
            url: "path/to/environment-report.pdf",
            icon: "chart-line"
        },
        {
            title: "AI in Recycling",
            description: "Technical paper on machine learning applications in waste management.",
            url: "path/to/ai-recycling.pdf",
            icon: "robot"
        }
    ];

    const container = document.getElementById('pdfContainer');

    pdfs.forEach(pdf => {
        const card = document.createElement('div');
        card.className = 'pdf-card';
        card.innerHTML = `
            <div class="pdf-preview">
                <i class="fas fa-${pdf.icon}"></i>
            </div>
            <div class="pdf-info">
                <h3>${pdf.title}</h3>
                <p>${pdf.description}</p>
                <button class="download-btn" data-url="${pdf.url}">
                    <i class="fas fa-download"></i> Download PDF
                </button>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('download-btn')) {
                window.open(pdf.url, '_blank');
            }
        });

        container.appendChild(card);
    });

    // Handle download buttons
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = e.target.getAttribute('data-url');
            if (url) {
                const a = document.createElement('a');
                a.href = url;
                a.download = true;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    });
});