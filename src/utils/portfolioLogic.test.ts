import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_PORTFOLIO_DATA } from '../data/initialPortfolio';
import {
  addExperienceToPortfolio,
  addModelToPortfolio,
  addPhotoToModel,
  addProjectToPortfolio,
  addSkillToGroup,
  buildPublicVisitorUrl,
  buildShowcaseShareUrl,
  deleteModelFromPortfolio,
  deletePhotoFromModel,
  deleteProjectFromPortfolio,
  doesSkillMatch,
  filterProjects,
  getMatchingExperienceIds,
  isOwnerStudioRoute,
  isPublicShowcaseMode,
  parseCanvasSurface,
  parseImportedPortfolioJson,
  removeSkillFromGroup,
  toggleCanvasSurface,
  validateExperienceInput,
  validateModelInput,
  validateProjectInput,
} from './portfolioLogic';

test('filters projects by category and search query accurately', () => {
  const year3 = filterProjects(INITIAL_PORTFOLIO_DATA.projects, 'NUS Year 3', '');
  assert.equal(year3.length, 2);
  assert.equal(year3[0].id, 'permeable-sports-corridor');
  assert.equal(year3[0].plates.length, 9);
  assert.equal(year3[1].id, '3rs-heritage-rethought');

  const revitProjects = filterProjects(INITIAL_PORTFOLIO_DATA.projects, 'All', 'Revit');
  assert.equal(revitProjects.length, 2);
  assert.ok(revitProjects.some((p) => p.id === 'project-army-camp'));
  assert.ok(revitProjects.some((p) => p.id === 'hangzhou-school-model'));

  const bambooProjects = filterProjects(INITIAL_PORTFOLIO_DATA.projects, 'NUS Year 2', 'venturi');
  assert.equal(bambooProjects.length, 1);
  assert.equal(bambooProjects[0].id, 'bend-boo-climatic-facade');

  const combinedOpenCelmer = filterProjects(
    INITIAL_PORTFOLIO_DATA.projects,
    'NUS Year 2',
    'oppenheimer'
  );
  assert.equal(combinedOpenCelmer.length, 1);
  assert.equal(combinedOpenCelmer[0].id, 'open-celmer');
  assert.equal(combinedOpenCelmer[0].plates.length, 16);
  assert.equal(
    INITIAL_PORTFOLIO_DATA.projects.some((p) => p.id === 'oppenheimer-two-sides'),
    false
  );

  const year1 = filterProjects(INITIAL_PORTFOLIO_DATA.projects, 'NUS Year 1', '');
  assert.equal(year1.length, 1);
  assert.equal(year1[0].id, 'the-flow-form-finding');
  assert.equal(year1[0].year, '2023');
  assert.equal(year1[0].plates.length, 2);
});

test('cross-highlights experiences and projects by selected skill', () => {
  assert.equal(doesSkillMatch(['Rhino', 'Illustrator'], 'rhino'), true);
  assert.equal(doesSkillMatch(['Revit', 'AutoCAD'], 'Rhino'), false);

  const matchedExp = getMatchingExperienceIds(INITIAL_PORTFOLIO_DATA.experiences, 'Revit');
  assert.equal(matchedExp.has('exp-dp'), true);
  assert.equal(matchedExp.has('exp-uci'), true);
  assert.equal(matchedExp.has('exp-gmp'), false);
});

test('validates required project and experience fields without silent fallbacks', () => {
  const emptyProject = validateProjectInput({
    title: '   ',
    subtitle: '',
    category: 'NUS Year 3',
    year: '',
    studioOrContext: '',
    location: '',
    scale: '',
    toolsRaw: '',
    summary: '',
    description: '',
    highlightsRaw: '',
  });
  assert.equal(emptyProject.valid, false);
  assert.ok(emptyProject.errors.title);
  assert.ok(emptyProject.errors.year);
  assert.ok(emptyProject.errors.summary);
  assert.ok(emptyProject.errors.toolsRaw);

  const emptyExp = validateExperienceInput({
    company: '',
    role: '',
    location: '',
    period: '',
    toolsRaw: '',
    highlightsRaw: '',
  });
  assert.equal(emptyExp.valid, false);
  assert.ok(emptyExp.errors.company);
  assert.ok(emptyExp.errors.role);
  assert.ok(emptyExp.errors.period);
  assert.ok(emptyExp.errors.highlightsRaw);
});

test('adds and deletes projects, experiences, and skills immutably', () => {
  const withNewProject = addProjectToPortfolio(INITIAL_PORTFOLIO_DATA, {
    title: 'Jurong Lake Timber Pavilion',
    subtitle: 'Modular Waterfront Acoustic Canopy',
    category: 'NUS Year 3',
    year: '2026',
    studioOrContext: 'NUS Design 6',
    location: 'Singapore',
    scale: '1:50',
    toolsRaw: 'Rhino, Grasshopper, Enscape',
    summary: 'Lightweight mass-timber lakeside pavilion with passive rainwater harvesting.',
    description: 'Full description.',
    highlightsRaw: 'Designed modular glulam ribs\nTested daylight comfort in Climate Studio',
  });

  assert.equal(withNewProject.projects.length, INITIAL_PORTFOLIO_DATA.projects.length + 1);
  assert.equal(withNewProject.projects[0].title, 'Jurong Lake Timber Pavilion');
  assert.deepEqual(withNewProject.projects[0].tools, ['Rhino', 'Grasshopper', 'Enscape']);

  const afterDelete = deleteProjectFromPortfolio(withNewProject, withNewProject.projects[0].id);
  assert.equal(afterDelete.projects.length, INITIAL_PORTFOLIO_DATA.projects.length);

  const withExp = addExperienceToPortfolio(INITIAL_PORTFOLIO_DATA, {
    company: 'WOHA Architects',
    role: 'Architectural Intern',
    location: 'Singapore',
    period: 'May 2026 – Aug 2026',
    toolsRaw: 'Rhino, Revit',
    highlightsRaw: 'Contributed to high-density tropical residential tower.',
  });
  assert.equal(withExp.experiences.length, INITIAL_PORTFOLIO_DATA.experiences.length + 1);
  assert.equal(withExp.experiences[0].company, 'WOHA Architects');

  const withSkill = addSkillToGroup(INITIAL_PORTFOLIO_DATA, 'sg-modeling', 'Grasshopper');
  const modelingGroup = withSkill.skillGroups.find((g) => g.id === 'sg-modeling');
  assert.ok(modelingGroup?.items.includes('Grasshopper'));

  const withoutSkill = removeSkillFromGroup(withSkill, 'sg-modeling', 'Grasshopper');
  const updatedGroup = withoutSkill.skillGroups.find((g) => g.id === 'sg-modeling');
  assert.equal(updatedGroup?.items.includes('Grasshopper'), false);
});

test('builds clean LinkedIn showcase share URLs and validates JSON import', () => {
  assert.equal(
    buildShowcaseShareUrl('https://portfolio.example.com/', '/'),
    'https://portfolio.example.com/?view=showcase'
  );
  assert.equal(isPublicShowcaseMode('?view=showcase'), true);
  assert.equal(isPublicShowcaseMode(''), false);

  const validImport = parseImportedPortfolioJson(JSON.stringify(INITIAL_PORTFOLIO_DATA));
  assert.equal(validImport.ok, true);

  const invalidImport = parseImportedPortfolioJson('{"broken": true}');
  assert.equal(invalidImport.ok, false);
});

test('parses and toggles Paper and Drafting Grid canvas surfaces safely', () => {
  assert.equal(parseCanvasSurface(null), 'paper');
  assert.equal(parseCanvasSurface('unexpected'), 'paper');
  assert.equal(parseCanvasSurface('grid'), 'grid');
  assert.equal(toggleCanvasSurface('paper'), 'grid');
  assert.equal(toggleCanvasSurface('grid'), 'paper');
});

test('separates private Owner Studio routes from public visitor routes', () => {
  assert.equal(isOwnerStudioRoute('/', '', ''), false);
  assert.equal(isOwnerStudioRoute('/', '#works', ''), false);
  assert.equal(isOwnerStudioRoute('/admin', '', ''), true);
  assert.equal(isOwnerStudioRoute('/', '#/admin', ''), true);
  assert.equal(isOwnerStudioRoute('/', '', '?studio=admin'), true);

  assert.equal(
    buildPublicVisitorUrl('https://portfolio.example.com/', '/admin'),
    'https://portfolio.example.com/'
  );
  assert.equal(
    buildPublicVisitorUrl('https://portfolio.example.com', '/'),
    'https://portfolio.example.com/'
  );
});

test('validates and manages 3D models and companion photos immutably', () => {
  const invalidModel = validateModelInput({
    title: ' ',
    subtitle: '',
    year: '',
    studioOrContext: '',
    scale: '',
    softwareRaw: '',
    description: '',
    modelUrl: '',
    format: 'glb',
  });
  assert.equal(invalidModel.valid, false);
  assert.ok(invalidModel.errors.title);
  assert.ok(invalidModel.errors.year);
  assert.ok(invalidModel.errors.modelUrl);

  const withModel = addModelToPortfolio(INITIAL_PORTFOLIO_DATA, {
    title: 'Bamboo Canopy Model',
    subtitle: 'Structural Spatial Study',
    year: '2025',
    studioOrContext: 'NUS Year 2',
    scale: '1:100',
    softwareRaw: 'Rhino, Grasshopper',
    description: 'Interactive structural canopy model.',
    modelUrl: '/assets/models/bamboo.glb',
    format: 'glb',
  });
  assert.equal(withModel.models.length, INITIAL_PORTFOLIO_DATA.models.length + 1);
  const newModelId = withModel.models[0].id;

  const withPhoto = addPhotoToModel(
    withModel,
    newModelId,
    '/assets/portfolio/page-01.jpg',
    'Basswood physical study'
  );
  assert.equal(withPhoto.models[0].photos.length, 1);
  const photoId = withPhoto.models[0].photos[0].id;

  const withoutPhoto = deletePhotoFromModel(withPhoto, newModelId, photoId);
  assert.equal(withoutPhoto.models[0].photos.length, 0);

  const withoutModel = deleteModelFromPortfolio(withoutPhoto, newModelId);
  assert.equal(withoutModel.models.length, INITIAL_PORTFOLIO_DATA.models.length);
});
