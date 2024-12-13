let map; // Declare map as a global variable
let geoLayer; // To store and remove the existing GeoJSON layer
let legend; // To store and remove the existing legend
let selectedYear = '2017'; // Default year for population density

// Navigation data structure
const POPULATION_SUBCATEGORIES = {
    totalPopulation: 'total-population',
    malePopulation: 'male-population',
    femalePopulation: 'female-population',
    malePopulationPercentage: 'male-population-percentage',
    femalePopulationPercentage: 'female-population-percentage',
    populationDensity: 'population-density'
}
const UNEMPLOYMENT_SUBCATEGORIES = {
    totalUnemploymentPercentage: 'total-unemployment-percentage',
    maleUnemploymentPercentage: 'male-unemployment-percentage',
    femaleUnemploymentPercentage: 'female-unemployment-percentage'
};
const FOREST_COVERAGE_SUBCATEGORIES = {
    forestCoveragePercentage: 'forest-coverage-percentage'
};
const RAINFALL_SUBCATEGORIES = {
    annualRainfall: 'annual-rainfall'
};
const mapDataCategories = [
    {
        label: 'Population',
        id: 'population',
        dataPath: '/zhimya/data/dzongkhag-population.json',
        subsections: [
            {
                label: 'Total Population',
                id: POPULATION_SUBCATEGORIES.totalPopulation,
            },
            {
                label: "Population By Male",
                id: POPULATION_SUBCATEGORIES.malePopulation
            },
            {
                label: "Population By Female",
                id: POPULATION_SUBCATEGORIES.femalePopulation
            },
            {
                label: "Male Population Percentage",
                id: POPULATION_SUBCATEGORIES.malePopulationPercentage
            },
            {
                label: "Female Population Percentage",
                id: POPULATION_SUBCATEGORIES.femalePopulationPercentage
            },
            {
                label: "Population Density",
                id: POPULATION_SUBCATEGORIES.populationDensity,
                dataPath: '/zhimya/data/pop-density.json',
                timeline: [2005, 2017]
            }
        ]
    },
    {
        label: 'Economy',
        id: 'economy',
        subsections: [
            {
                label: 'Total Unemployment Percentage',
                id: UNEMPLOYMENT_SUBCATEGORIES.totalUnemploymentPercentage,
                dataPath: '/zhimya/data/unemployment.json'
            },
            {
                label: 'Male Unemployment Percentage',
                id: UNEMPLOYMENT_SUBCATEGORIES.maleUnemploymentPercentage,
                dataPath: '/zhimya/data/unemployment.json'
            },
            {
                label: 'Female Unemployment Percentage',
                id: UNEMPLOYMENT_SUBCATEGORIES.femaleUnemploymentPercentage,
                dataPath: '/zhimya/data/unemployment.json'
            }
        ],
    },
    {
        label: 'Environment',
        id: 'environment',
        subsections: [
            {
                label: 'Forest Coverage Percentage',
                id: FOREST_COVERAGE_SUBCATEGORIES.forestCoveragePercentage,
                dataPath: '/zhimya/data/forest-coverage.json'
            },
            {
                label: 'Annual Rainfall',
                id: RAINFALL_SUBCATEGORIES.annualRainfall,
                dataPath: '/zhimya/data/annual-rainfall.json',
                timeline: [2018, 2019, 2020, 2021, 2022]
            }
        ]
    }
];

let activeSubCategory = null;

function createTogglesForYear(years) {
    const yearToggleContainer = document.createElement('div');
    yearToggleContainer.id = 'year-toggle-container';
    yearToggleContainer.className = 'year-toggle';
    yearToggleContainer.innerHTML = `
        <label for="year-toggle">Select Year:</label>
        <select id="year-toggle">
            ${years.map(year => `<option value="${year}" id=${year}>${year}</option>`).join('')}
        </select>
    `;
    yearToggleContainer.style.display = 'none';
    return yearToggleContainer;
}

const handleYearChange = (e) => {
    console.log("How many changes")
    selectedYear = e.target.value;
    if (activeSubCategory && (activeSubCategory.id === POPULATION_SUBCATEGORIES.populationDensity || activeSubCategory.id === RAINFALL_SUBCATEGORIES.annualRainfall)) {
        loadData(activeSubCategory.id === POPULATION_SUBCATEGORIES.populationDensity ? '/zhimya/data/pop-density.json' : '/zhimya/data/annual-rainfall.json', activeSubCategory.id);
    }
}

function updateYearToggle(years) {
    const previousYearToggle = document.getElementById('year-toggle');
    if (previousYearToggle) {
        previousYearToggle.removeEventListener('change', handleYearChange);
        previousYearToggle.remove()
    }
    selectedYear = years[0];
    const updateYearToggle = createTogglesForYear(years);
    const mapContainer = document.getElementById('map');
    mapContainer.appendChild(updateYearToggle);
    document.addEventListener('change', handleYearChange);
    updateYearToggle.style.display = 'block';
}

function removeYearToggle() {
    const yearToggle = document.getElementById('year-toggle-container');
    if (yearToggle) {
        yearToggle.removeEventListener('change', handleYearChange);
        yearToggle.remove();
    }
}

function createNavigation() {
    // Create navigation container
    const navContainer = document.createElement('div');
    navContainer.id = 'map-data-nav';
    navContainer.className = 'map-data-nav';

    // Create navigation header
    const navHeader = document.createElement('div');
    navHeader.className = 'nav-header';
    navHeader.innerHTML = '<h2>Bhutan Data Explorer</h2>';
    navContainer.appendChild(navHeader);

    // Create navigation menu
    const navMenu = document.createElement('nav');
    navMenu.className = 'nav-menu';

    // Iterate through main categories
    mapDataCategories.forEach((categoryData) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'nav-category';
        const categoryLabel = document.createElement('div');
        categoryLabel.addEventListener('click', (e) => {
            categorySection.classList.toggle('expanded');
        })
        categoryLabel.className = 'nav-category-label';
        categoryLabel.textContent = categoryData.label;
        categorySection.appendChild(categoryLabel);
        const subsectionsContainer = document.createElement('div');
        subsectionsContainer.className = 'nav-subsections';
        categoryData.subsections.forEach((subData) => {
            const subsectionItem = document.createElement('div');
            subsectionItem.id = subData.id;
            subsectionItem.className = 'nav-subsection-item';
            subsectionItem.textContent = subData.label;
            subsectionItem.addEventListener('click', (e) => {
                if (activeSubCategory) {
                    activeSubCategory.classList.remove('active');
                }
                activeSubCategory = subsectionItem;
                subsectionItem.classList.add('active');
                if (subData.timeline) {
                    updateYearToggle(subData.timeline);
                } else {
                    removeYearToggle();
                }
                loadData(subData.dataPath || categoryData.dataPath || '/zhimya/data/dzongkhag-population.json', subData.id)
            })
            subsectionsContainer.appendChild(subsectionItem);
        });
        categorySection.appendChild(subsectionsContainer);
        navMenu.appendChild(categorySection);
    })
    navContainer.appendChild(navMenu);
    const mapContainer = document.getElementById('map');
    mapContainer.style.position = 'relative';
    mapContainer.appendChild(navContainer);
}

function getUnemploymentColors(d) {
    return d > 15 ? '#800026' :
        d > 10 ? '#BD0026' :
            d > 5 ? '#E31A1C' :
                d > 2 ? '#FC4E2A' :
                    d > 1 ? '#FD8D3C' :
                        '#FEB24C';
}

function getForestCoverageColors(d) {
    return d > 90 ? '#006400' :
        d > 80 ? '#228B22' :
            d > 70 ? '#32CD32' :
                d > 60 ? '#7CFC00' :
                    d > 50 ? '#ADFF2F' :
                        d > 40 ? '#FFFF00' :
                            d > 30 ? '#FFD700' :
                                d > 20 ? '#FFA500' :
                                    d > 10 ? '#FF8C00' :
                                        '#FF4500';
}

function getRainfallColors(d) {
    return d > 5000 ? '#08306b' :
        d > 4000 ? '#08519c' :
            d > 3000 ? '#2171b5' :
                d > 2000 ? '#4292c6' :
                    d > 1000 ? '#6baed6' :
                        d > 500 ? '#9ecae1' :
                            '#c6dbef';
}

function getPopulationColors(d, selectedSubcategory) {
    const numbersWise = d > 100000 ? '#800026' :
        d > 60000 ? '#BD0026' :
            d > 35000 ? '#E31A1C' :
                d > 15000 ? '#FC4E2A' :
                    d > 5000 ? '#FD8D3C' :
                        d > 2000 ? '#FEB24C' :
                            '#FFEDA0';
    const percentageWise = d > 60 ? '#FF5733' :
        d > 55 ? '#FF6F61' :
            d > 50 ? '#FF8D72' :
                d > 45 ? '#FFA07A' :
                    d > 40 ? '#FFB6C1' :
                        d > 35 ? '#FFDAB9' :
                            d > 30 ? '#FFE4B5' :
                                d > 25 ? '#FFFACD' :
                                    d > 20 ? '#FFFFE0' :
                                        '#FFFFFF';
    const densityWise = d > 50 ? '#800026' :
        d > 40 ? '#BD0026' :
            d > 30 ? '#E31A1C' :
                d > 20 ? '#FC4E2A' :
                    d > 10 ? '#FD8D3C' :
                        d > 5 ? '#FEB24C' :
                            '#FFEDA0';
    const unemploymentWise = getUnemploymentColors(d);
    const forestCoverageWise = getForestCoverageColors(d);
    const rainfallWise = getRainfallColors(d);
    switch (selectedSubcategory) {
        case POPULATION_SUBCATEGORIES.totalPopulation:
            return numbersWise
        case POPULATION_SUBCATEGORIES.malePopulation:
            return numbersWise
        case POPULATION_SUBCATEGORIES.femalePopulation:
            return numbersWise
        case POPULATION_SUBCATEGORIES.malePopulationPercentage:
        case POPULATION_SUBCATEGORIES.femalePopulationPercentage:
            return percentageWise
        case POPULATION_SUBCATEGORIES.populationDensity:
            return densityWise
        case UNEMPLOYMENT_SUBCATEGORIES.totalUnemploymentPercentage:
        case UNEMPLOYMENT_SUBCATEGORIES.maleUnemploymentPercentage:
        case UNEMPLOYMENT_SUBCATEGORIES.femaleUnemploymentPercentage:
            return unemploymentWise;
        case FOREST_COVERAGE_SUBCATEGORIES.forestCoveragePercentage:
            return forestCoverageWise;
        case RAINFALL_SUBCATEGORIES.annualRainfall:
            return rainfallWise;
    }
}

const PERCENTAGE_WISE_SUBCATEGORIES = [POPULATION_SUBCATEGORIES.malePopulationPercentage, POPULATION_SUBCATEGORIES.femalePopulationPercentage, UNEMPLOYMENT_SUBCATEGORIES.totalUnemploymentPercentage, UNEMPLOYMENT_SUBCATEGORIES.maleUnemploymentPercentage, UNEMPLOYMENT_SUBCATEGORIES.femaleUnemploymentPercentage];

// Initialize the map once
function initializeMap() {
    map = L.map('map').setView([27.5142, 90.4336], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    createNavigation();
}

const formatNumber = (number) => {
    const userLocale = window.navigator.language;
    return new Intl.NumberFormat(userLocale, { maximumFractionDigits: 1 }).format(number);
}

// based on different subcategories the values range differently
const legendsValueMap = {
    [POPULATION_SUBCATEGORIES.totalPopulation]: [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
    [POPULATION_SUBCATEGORIES.malePopulation]: [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
    [POPULATION_SUBCATEGORIES.femalePopulation]: [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
    [POPULATION_SUBCATEGORIES.malePopulationPercentage]: [20, 25, 30, 35, 40, 45, 50, 55, 60],
    [POPULATION_SUBCATEGORIES.femalePopulationPercentage]: [20, 25, 30, 35, 40, 45, 50, 55, 60],
    [POPULATION_SUBCATEGORIES.populationDensity]: [0, 5, 10, 20, 30, 40, 50],
    [UNEMPLOYMENT_SUBCATEGORIES.totalUnemploymentPercentage]: [0, 1, 2, 5, 10, 15],
    [UNEMPLOYMENT_SUBCATEGORIES.maleUnemploymentPercentage]: [0, 1, 2, 5, 10, 15],
    [UNEMPLOYMENT_SUBCATEGORIES.femaleUnemploymentPercentage]: [0, 1, 2, 5, 10, 15],
    [FOREST_COVERAGE_SUBCATEGORIES.forestCoveragePercentage]: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    [RAINFALL_SUBCATEGORIES.annualRainfall]: [0, 500, 1000, 2000, 3000, 4000, 5000]
}
// Update legend title based on subcategory
const legendTitles = {
    [POPULATION_SUBCATEGORIES.totalPopulation]: 'Total Population',
    [POPULATION_SUBCATEGORIES.malePopulation]: 'Male Population',
    [POPULATION_SUBCATEGORIES.femalePopulation]: 'Female Population',
    [POPULATION_SUBCATEGORIES.malePopulationPercentage]: "Male Population By Percentage",
    [POPULATION_SUBCATEGORIES.femalePopulationPercentage]: "Female Population By Percentage",
    [POPULATION_SUBCATEGORIES.populationDensity]: `Population Density (per km²) - ${selectedYear}`,
    [UNEMPLOYMENT_SUBCATEGORIES.totalUnemploymentPercentage]: 'Total Unemployment Rate (%)',
    [UNEMPLOYMENT_SUBCATEGORIES.maleUnemploymentPercentage]: 'Total Male Unemployment Rate (%)',
    [UNEMPLOYMENT_SUBCATEGORIES.femaleUnemploymentPercentage]: 'Total Female Unemployment Rate (%)',
    [FOREST_COVERAGE_SUBCATEGORIES.forestCoveragePercentage]: 'Forest Coverage Percentage',
    [RAINFALL_SUBCATEGORIES.annualRainfall]: `Annual Rainfall (mm) - ${selectedYear}`
};

function loadData(dataPath = '/zhimya/data/dzongkhag-population.json', selectedSubcategory = 'total-population') {
    // Remove existing GeoJSON layer if it exists
    if (geoLayer) {
        map.removeLayer(geoLayer);
    }
    Promise.all([
        d3.json("/zhimya/data/dzongkhag-markers.json"),
        d3.json(dataPath)
    ])
        .then(([geoJsonData, populationData]) => {
            // Function to get color based on population
            function getColor(d) {
                return getPopulationColors(d, selectedSubcategory);
            }

            // Style function for GeoJSON layer
            function style(feature) {
                // Modify this based on the selected subcategory
                let populationValue;
                switch (selectedSubcategory) {
                    case POPULATION_SUBCATEGORIES.malePopulation:
                        populationValue = populationData[feature.properties.NAME_1]?.["Male"];
                        break;
                    case POPULATION_SUBCATEGORIES.femalePopulation:
                        populationValue = populationData[feature.properties.NAME_1]?.["Female"];
                        break;
                    case POPULATION_SUBCATEGORIES.malePopulationPercentage:
                        populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Male"] / populationData[feature.properties.NAME_1]?.["Both Sex"] * 100);
                        break;
                    case POPULATION_SUBCATEGORIES.femalePopulationPercentage:
                        populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Female"] / populationData[feature.properties.NAME_1]?.["Both Sex"] * 100);
                        break;
                    case POPULATION_SUBCATEGORIES.populationDensity:
                        populationValue = populationData[feature.properties.NAME_1]?.["density"]?.[selectedYear];
                        break;
                    case UNEMPLOYMENT_SUBCATEGORIES.maleUnemploymentPercentage:
                        populationValue = populationData[feature.properties.NAME_1]?.["Unemployment Rate (%)"]?.["Male"];
                        break;
                    case UNEMPLOYMENT_SUBCATEGORIES.femaleUnemploymentPercentage:
                        populationValue = populationData[feature.properties.NAME_1]?.["Unemployment Rate (%)"]?.["Female"];
                        break;
                    case UNEMPLOYMENT_SUBCATEGORIES.totalUnemploymentPercentage:
                        populationValue = populationData[feature.properties.NAME_1]?.["Unemployment Rate (%)"]?.["Total"];
                        break;
                    case FOREST_COVERAGE_SUBCATEGORIES.forestCoveragePercentage:
                        populationValue = populationData.find(d => d.dzongkhag === feature.properties.NAME_1)?.forestCoverPercentage;
                        break;
                    case RAINFALL_SUBCATEGORIES.annualRainfall:
                        populationValue = populationData[feature.properties.NAME_1]?.[selectedYear];
                        break;
                    default:
                        populationValue = populationData[feature.properties.NAME_1]?.["Both Sex"];
                }

                return {
                    fillColor: getColor(populationValue),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7 // Ensure fillOpacity is set correctly
                };
            }

            // Remove existing legend if it exists
            if (legend) {
                map.removeControl(legend);
            }

            // Create new legend
            legend = L.control({ position: 'bottomleft' });

            legend.onAdd = function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                // Update legend title based on subcategory
                const legendTitles = {
                    [POPULATION_SUBCATEGORIES.totalPopulation]: 'Total Population',
                    [POPULATION_SUBCATEGORIES.malePopulation]: 'Male Population',
                    [POPULATION_SUBCATEGORIES.femalePopulation]: 'Female Population',
                    [POPULATION_SUBCATEGORIES.malePopulationPercentage]: "Male Population By Percentage",
                    [POPULATION_SUBCATEGORIES.femalePopulationPercentage]: "Female Population By Percentage",
                    [POPULATION_SUBCATEGORIES.populationDensity]: `Population Density (per km²) - ${selectedYear}`,
                    [UNEMPLOYMENT_SUBCATEGORIES.totalUnemploymentPercentage]: 'Total Unemployment Rate (%)',
                    [UNEMPLOYMENT_SUBCATEGORIES.maleUnemploymentPercentage]: 'Total Male Unemployment Rate (%)',
                    [UNEMPLOYMENT_SUBCATEGORIES.femaleUnemploymentPercentage]: 'Total Female Unemployment Rate (%)',
                    [FOREST_COVERAGE_SUBCATEGORIES.forestCoveragePercentage]: 'Forest Coverage Percentage',
                    [RAINFALL_SUBCATEGORIES.annualRainfall]: `Annual Rainfall (mm) - ${selectedYear}`
                };

                // Legend title
                div.innerHTML += `<h4 id="legendDhiAniEnn">${legendTitles[selectedSubcategory]}</h4>`;

                // Loop through population intervals and generate a label with a colored square for each interval
                const loopOver = legendsValueMap[selectedSubcategory];
                for (let i = 0; i < loopOver.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getColor(loopOver[i] + 1) + '"></i> ' +
                        loopOver[i] + (loopOver[i + 1] ? '&ndash;' + loopOver[i + 1] + '<br>' : '+');
                }

                return div;
            };

            legend.addTo(map);

            // Add new GeoJSON data to the map
            geoLayer = L.geoJSON(geoJsonData, {
                style: style,
                onEachFeature: function (feature, layer) {
                    // Determine which population to display in tooltip
                    let populationValue;
                    let populationLabel;
                    let additionalInfo = '';
                    switch (selectedSubcategory) {
                        case POPULATION_SUBCATEGORIES.malePopulation:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Male"]);
                            populationLabel = "Male Population"
                            break;
                        case POPULATION_SUBCATEGORIES.femalePopulation:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Female"]);
                            populationLabel = "Female Population"
                            break;
                        case POPULATION_SUBCATEGORIES.malePopulationPercentage:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Male"] / populationData[feature.properties.NAME_1]?.["Both Sex"] * 100) + "%";
                            populationLabel = "Male Population Percentage"
                            break;
                        case POPULATION_SUBCATEGORIES.femalePopulationPercentage:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Female"] / populationData[feature.properties.NAME_1]?.["Both Sex"] * 100) + "%";
                            populationLabel = "Female Population Percentage"
                            break;
                        case POPULATION_SUBCATEGORIES.populationDensity:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["density"]?.[selectedYear]);
                            populationLabel = `Population Density (per km²) - ${selectedYear}`
                            break;
                        case UNEMPLOYMENT_SUBCATEGORIES.totalUnemploymentPercentage:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Unemployment Rate (%)"]?.["Total"]) + "%";
                            populationLabel = "Total Unemployment Percentage";
                            additionalInfo = `
                                Male Unemployed: ${populationData[feature.properties.NAME_1]?.["Number"]?.["Male"]}<br>
                                Female Unemployed: ${populationData[feature.properties.NAME_1]?.["Number"]?.["Female"]}
                            `;
                            break;
                        case UNEMPLOYMENT_SUBCATEGORIES.maleUnemploymentPercentage:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Unemployment Rate (%)"]?.["Male"]) + "%";
                            populationLabel = "Male Unemployment Percentage";
                            additionalInfo = `
                                Male Unemployed: ${populationData[feature.properties.NAME_1]?.["Number"]?.["Male"]}<br>
                                Female Unemployed: ${populationData[feature.properties.NAME_1]?.["Number"]?.["Female"]}
                            `;
                            break;
                        case UNEMPLOYMENT_SUBCATEGORIES.femaleUnemploymentPercentage:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Unemployment Rate (%)"]?.["Female"]) + "%";
                            populationLabel = "Female Unemployment Percentage";
                            additionalInfo = `
                                Male Unemployed: ${populationData[feature.properties.NAME_1]?.["Number"]?.["Male"]}<br>
                                Female Unemployed: ${populationData[feature.properties.NAME_1]?.["Number"]?.["Female"]}
                            `;
                            break;
                        case FOREST_COVERAGE_SUBCATEGORIES.forestCoveragePercentage:
                            populationValue = formatNumber(populationData.find(d => d.dzongkhag === feature.properties.NAME_1)?.forestCoverPercentage) + "%";
                            populationLabel = "Forest Coverage Percentage";
                            additionalInfo = `
                                Forest Area: ${populationData.find(d => d.dzongkhag === feature.properties.NAME_1)?.forestCover}
                            `;
                            break;
                        case RAINFALL_SUBCATEGORIES.annualRainfall:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.[selectedYear]);
                            populationLabel = `Annual Rainfall (mm) - ${selectedYear}`;
                            break;
                        default:
                            populationValue = formatNumber(populationData[feature.properties.NAME_1]?.["Both Sex"]);
                            populationLabel = "Total Population"
                    }

                    layer.bindTooltip(`
                        <strong>${feature.properties.NAME_1}</strong><br>
                        ${populationLabel}: ${populationValue}<br>
                        ${additionalInfo}
                    `, {
                        permanent: false,
                        direction: 'right',
                        className: 'dzongkhag-tooltip'
                    });
                }
            }).addTo(map);
        })
        .catch(err => {
            console.error("Error loading data:", err);
        });
}

// Initialize the map once
initializeMap();
loadData();
