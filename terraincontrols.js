function addSVG(div) {
    return div.insert("svg", ":first-child")
        .attr("height", 400)
        .attr("width", 400)
        .attr("viewBox", "-500 -500 1000 1000");
}
var meshDiv = d3.select("div#mesh");
var meshSVG = addSVG(meshDiv);

var meshPts = null;
var meshVxs = null;
var meshDual = false;

function meshDraw() {
    if (meshDual && !meshVxs) {
        meshVxs = makeMesh(meshPts).vxs;
    }
    visualizePoints(meshSVG, meshDual ? meshVxs : meshPts);
}


var primDiv = d3.select("div#prim");
var primSVG = addSVG(primDiv);

var primH = zero(generateGoodMesh(4096));

function primDraw() {
    visualizeVoronoi(primSVG, primH, -1, 1);
    drawPaths(primSVG, 'coast', contour(primH, 0));
}

primDraw()

var erodeDiv = d3.select("div#erode");
var erodeSVG = addSVG(erodeDiv);

function generateUneroded() {
    var mesh = generateGoodMesh(4096);
    var h = add(slope(mesh, randomVector(4)),
                cone(mesh, runif(-1, 1)),
                mountains(mesh, 50));
    h = peaky(h);
    h = fillSinks(h);
    h = setSeaLevel(h, 0.5);
    return h;
}

var erodeH = primH;
var erodeViewErosion = false;

function erodeDraw() {
    if (erodeViewErosion) {
        visualizeVoronoi(erodeSVG, erosionRate(erodeH));
    } else {
        visualizeVoronoi(erodeSVG, erodeH, 0, 1);
    }
    drawPaths(erodeSVG, "coast", contour(erodeH, 0));
}

var physDiv = d3.select("div#phys");
var physSVG = addSVG(physDiv);
var physH = erodeH;

var physViewCoast = false;
var physViewRivers = false;
var physViewSlope = false;
var physViewHeight = true;

function physDraw() {
    if (physViewHeight) {
        visualizeVoronoi(physSVG, physH, 0);
    } else {
        physSVG.selectAll("path.field").remove();
    }
    if (physViewCoast) {
        drawPaths(physSVG, "coast", contour(physH, 0));
    } else {
        drawPaths(physSVG, "coast", []);
    }
    if (physViewRivers) {
        drawPaths(physSVG, "river", getRivers(physH, 0.01));
    } else {
        drawPaths(physSVG, "river", []);
    }
    if (physViewSlope) {
        visualizeSlopes(physSVG, {h:physH});
    } else {
        visualizeSlopes(physSVG, {h:zero(physH.mesh)});
    }
}

var cityDiv = d3.select("div#city");
var citySVG = addSVG(cityDiv);

var cityViewScore = true;

function newCityRender(h) {
    h = h || generateCoast({npts:4096, extent: defaultExtent});
    return {
        params: defaultParams,
        h: h,
        cities: []
    };
}
var cityRender = newCityRender(physH);
function cityDraw() {
    cityRender.terr = getTerritories(cityRender);
    if (cityViewScore) {
        var score = cityScore(cityRender.h, cityRender.cities);
        visualizeVoronoi(citySVG, score, d3.max(score) - 0.5);
    } else {
        visualizeVoronoi(citySVG, cityRender.terr);
    }
    drawPaths(citySVG, 'coast', contour(cityRender.h, 0));
    drawPaths(citySVG, 'river', getRivers(cityRender.h, 0.01));
    drawPaths(citySVG, 'border', getBorders(cityRender));
    visualizeSlopes(citySVG, cityRender);
    visualizeCities(citySVG, cityRender);
}

var finalDiv = d3.select("div#final");
var finalSVG = addSVG(finalDiv);

function generatePointsButton()
{
    meshDual = false;
    meshVxs = null;
    meshPts = generatePoints(256);
    meshDraw();
}

function improvePointsButton() 
{
    meshPts = improvePoints(meshPts);
    meshVxs = null;
    meshDraw();
}

function voronoiCornersButton() 
{
    meshDual = !meshDual;
    meshDraw();
}

function resetFlatButton() 
{
    primH = zero(primH.mesh); 
    primDraw();
}

function addSlopeButton()
{
    primH = add(primH, slope(primH.mesh, randomVector(4)));
    primDraw();
}

function addConeButton() 
{
    primH = add(primH, cone(primH.mesh, -0.5));
    primDraw();
}

function addInvConeButton()
{
    primH = add(primH, cone(primH.mesh, 0.5));
    primDraw();
}

function addBlobsButton()
{
    primH = add(primH, mountains(primH.mesh, 5));
    primDraw();
}

function normalizeButton()
{
    primH = normalize(primH);
    primDraw();
}

function roundHillsButton()
{
    primH = peaky(primH);
    primDraw();
}

function relaxButton() 
{
    primH = relax(primH);
    primDraw();
}

function setSeaLevelButton()
{
    primH = setSeaLevel(primH, 0.5);
    primDraw();
}

function generateUnerodedButton()
{
    erodeH = generateUneroded();
    erodeDraw();
}

function copyHeighMapButton()
{
    erodeH = primH;
    erodeDraw();
}

function erodeButton()
{
    erodeH = doErosion(erodeH, 0.1);
    erodeDraw();
}

function setSeaLevelButtonErode()
{
    erodeH = setSeaLevel(erodeH, 0.5);
    erodeDraw();
}

function cleanCoastButton()
{
    erodeH = cleanCoast(erodeH, 1);
    erodeH = fillSinks(erodeH);
    erodeDraw();
}

function showErosionButton()
{
    erodeViewErosion = !erodeViewErosion;
    erodeDraw();
}

function generateCoastButton()
{
    physH = generateCoast({npts:4096, extent:defaultExtent});
    physDraw();
}

function copyHeightButtonPhys()
{
    physH = erodeH;
    physDraw();
}

function showCoastButton()
{
    physViewCoast = !physViewCoast;
    physDraw();
}

function showRiversButton()
{
    physViewRivers = !physViewRivers;
    physDraw();
}

function showShadingButton()
{
    physViewSlope = !physViewSlope;
    physDraw();
}

function hideHeightButton()
{
    physViewHeight = !physViewHeight;
    physDraw();
}

function renderCityButton()
{
    cityRender = newCityRender();
    cityDraw();
}

function renderCityAboveButton()
{
    cityRender = newCityRender(physH);
    cityDraw();
}

function addCityButton()
{
    placeCity(cityRender);
    cityDraw();
}

function showTerritoriesButton()
{
    cityViewScore = !cityViewScore;
    cityDraw();
}

function drawMapButton()
{
    drawMap(finalSVG, cityRender);
}

function doMapButton()
{
    doMap(finalSVG, defaultParams);
}

