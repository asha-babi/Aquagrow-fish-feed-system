/**
 * ════════════════════════════════════════════════════════════
 *  Aquagrow – APPLICATION LOGIC
 *  Judy Fish Facilities, Gaza Province, Mozambique
 *
 *  Shared by every page (dashboard, formulations, ingredients,
 *  production). Depends on acgrow-database.js and
 *  acgrow-firebase.js being loaded first, and on each page
 *  defining `const CURRENT_PAGE = '...'` before this file.
 * ════════════════════════════════════════════════════════════
 */

function checkNutrient(value, [min, max]) {
  if (value >= min && value <= max) return 'pass';
  if (Math.abs(value - min) < 3 || Math.abs(value - max) < 3) return 'warn';
  return 'fail';
}

function complianceHTML(stage) {
  const s = STAGES[stage], t = s.totals, r = s.requirements;
  const nutrients = [
    { label:'Protein',     val:t.protein, range:r.protein, unit:'%' },
    { label:'Lipid/Fat',   val:t.lipid,   range:r.lipid,   unit:'%' },
    { label:'Ash',         val:t.ash,     range:r.ash,     unit:'%' },
    { label:'Crude Fibre', val:t.fiber,   range:r.fiber,   unit:'%' },
  ];
  const allPass  = nutrients.every(n => checkNutrient(n.val, n.range) === 'pass');
  const verdict  = allPass
    ? `<div class="verdict pass"><span class="verdict-icon"></span> This formulation MEETS FAO nutritional requirements for the ${s.name} stage.</div>`
    : `<div class="verdict fail"><span class="verdict-icon">⚠️</span> One or more nutrients fall outside FAO requirements for the ${s.name} stage – review highlighted items.</div>`;
  const items = nutrients.map(n => {
    const status = checkNutrient(n.val, n.range);
    const icons  = { pass:'✔ COMPLIANT', warn:'≈ BORDERLINE', fail:'✖ OUT OF RANGE' };
    const maxLbl = n.range[0] === 0 ? `≤ ${n.range[1]}${n.unit}` : `${n.range[0]}–${n.range[1]}${n.unit}`;
    return `<div class="comp-item ${status}">
      <div class="comp-label">${n.label}</div>
      <div class="comp-value">${n.val.toFixed(2)}${n.unit}</div>
      <div class="comp-range">FAO: ${maxLbl}</div>
      <div class="comp-status">${icons[status]}</div>
    </div>`;
  }).join('');
  return verdict + `<div class="compliance-grid">${items}</div>`;
}

function renderDashboard() {
  const stageIcons = ['🥚','🐟','🐠'];

  // FAO table
  document.getElementById('fao-table-body').innerHTML = STAGES.map((s,i) => {
    const r = s.requirements;
    return `<tr>
      <td><span class="stage-pill">${stageIcons[i]} ${s.name}</span></td>
      <td>${s.range}</td>
      <td><span class="fao-badge protein">${r.protein[0]}–${r.protein[1]}%</span></td>
      <td><span class="fao-badge lipid">${r.lipid[0]}–${r.lipid[1]}%</span></td>
      <td><span class="fao-badge ash">≤ ${r.ash[1]}%</span></td>
      <td><span class="fao-badge fiber">≤ ${r.fiber[1]}%</span></td>
    </tr>`;
  }).join('');

  // Comparison cards
  document.getElementById('compare-cards').innerHTML = STAGES.map((s,i) => {
    const t = s.totals, c = s.commercial;
    return `<div class="compare-card">
      <div class="compare-head">${stageIcons[i]} ${s.name} STAGE (${s.range})</div>
      <div class="compare-body">
        ${[['Protein', t.protein+'%', c.protein],['Fat / Lipid', t.lipid+'%', c.lipid],
           ['Crude Fibre', t.fiber+'%', c.fiber],['Ash', t.ash+'%', c.ash],['Moisture','12%',c.moisture]]
          .map(([n,l,r]) => `<div class="compare-row">
            <span class="nutrient-name">${n}</span>
            <div class="compare-vals">
              <span class="local-val">${l}</span>
              <span class="comm-val">${r}</span>
            </div>
          </div>`).join('')}
        <div style="margin-top:10px;font-size:11px;color:var(--muted);display:flex;justify-content:space-between;">
          <span style="color:var(--teal-deep);font-weight:700;">■ Aquagrow</span><span>■ Commercial</span>
        </div>
      </div>
    </div>`;
  }).join('');

  // Ingredient gallery
  const fallbackEmojis = { 'Fishmeal':'🐟', 'Peanut cake':'🥜', 'Rice bran':'🌾', 'Wheat bran':'🌾', 'Cassava':'🌱', 'Soybean oil':'🫙' };
  document.getElementById('ingredient-gallery').innerHTML = INGREDIENT_GALLERY.map(item => `
    <div class="gallery-item">
      <img
        class="gallery-img"
        src="${item.url}"
        alt="${item.name}"
        loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      />
      <div class="gallery-img-fallback" style="display:none;">
        ${fallbackEmojis[item.name] || '🌿'}
      </div>
      <div class="gallery-caption">
        <strong>${item.name}</strong>${item.caption}
      </div>
    </div>`).join('');

  // About Us section
  document.getElementById('dash-about-hero').innerHTML = `
    <h2>${ABOUT.headline}</h2>
    <p>${ABOUT.intro}</p>`;
  document.getElementById('dash-about-mission').textContent = ABOUT.mission;
  document.getElementById('dash-about-founded').textContent = ABOUT.founded;

  // Contact strip
  document.getElementById('dash-contact-strip').innerHTML = [
    { icon:'📍', label:'Address', value: ABOUT.address  },
    { icon:'✉️', label:'Email',   value: ABOUT.email    },
    { icon:'📞', label:'Phone',   value: ABOUT.phone    },
    { icon:'📅', label:'Founded', value: ABOUT.founded  },
  ].map(d => `
    <div class="contact-tile">
      <span class="contact-tile-icon">${d.icon}</span>
      <div>
        <div class="contact-tile-label">${d.label}</div>
        <div class="contact-tile-value">${d.value}</div>
      </div>
    </div>`).join('');

  syncToFirebase();
}

async function syncToFirebase() {
  if (!firebaseReady || !db) return;
  console.log('🔄 Syncing data to Firebase…');
  try {
    const batch = db.batch();
    ingredients.forEach(ing => {
      const ref = db.collection('ingredients').doc(String(ing.id));
      batch.set(ref, ing);
    });
    productionRecords.forEach(rec => {
      const ref = db.collection('productionRecords').doc(String(rec.id));
      batch.set(ref, rec);
    });
    await batch.commit();
    console.log('✅ Data synced to Firebase Firestore');
  } catch(err) {
    console.error('❌ Firebase sync failed:', err.message);
  }
}

let currentStage = 0;

function selectStage(idx, el) {
  currentStage = idx;
  document.querySelectorAll('.stage-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderFormulation(idx);
}

function renderFormulation(idx) {
  const s = STAGES[idx], t = s.totals;
  const rows = s.ingredients.map(ing => `<tr>
    <td>${ing.name}</td>
    <td class="num-cell">${ing.pct.toFixed(2)}</td>
    <td class="num-cell">${ing.protein.toFixed(2)}</td>
    <td class="num-cell">${ing.lipid.toFixed(2)}</td>
    <td class="num-cell">${ing.ash.toFixed(2)}</td>
    <td class="num-cell">${ing.fiber.toFixed(2)}</td>
  </tr>`).join('');
  document.getElementById('formulation-content').innerHTML = `
    <div class="card">
      <div class="card-title">Diet Formulation – ${s.name} Stage (${s.range})</div>
      <div class="tbl-wrap"><table>
        <thead><tr>
          <th>Ingredient</th><th class="num-cell">% in Diet</th>
          <th class="num-cell">Protein (pp)</th><th class="num-cell">Lipid (pp)</th>
          <th class="num-cell">Ash (pp)</th><th class="num-cell">Fiber (pp)</th>
        </tr></thead>
        <tbody>${rows}
          <tr class="total-row">
            <td>TOTAL</td><td class="num-cell">100.00</td>
            <td class="num-cell">${t.protein.toFixed(2)}</td>
            <td class="num-cell">${t.lipid.toFixed(2)}</td>
            <td class="num-cell">${t.ash.toFixed(2)}</td>
            <td class="num-cell">${t.fiber.toFixed(2)}</td>
          </tr>
        </tbody>
      </table></div>
      <p style="margin-top:12px;font-size:12px;color:var(--muted);">
        FAO ranges: Protein ${s.requirements.protein[0]}–${s.requirements.protein[1]}% · Lipid ${s.requirements.lipid[0]}–${s.requirements.lipid[1]}% · Ash ≤${s.requirements.ash[1]}% · Fiber ≤${s.requirements.fiber[1]}%
      </p>
    </div>
    <div class="card">
      <div class="card-title">Nutritional Compliance – ${s.name} Stage</div>
      ${complianceHTML(idx)}
    </div>
    <div class="card">
      <div class="card-title">Aquagrow vs Commercial Feed – ${s.name} Stage</div>
      <div class="tbl-wrap"><table>
        <thead><tr>
          <th>Nutrient</th><th class="num-cell">Aquagrow (Local)</th>
          <th class="num-cell">Commercial</th><th class="num-cell">FAO Range</th>
        </tr></thead>
        <tbody>
          <tr><td>Protein (%)</td><td class="num-cell">${t.protein}</td><td class="num-cell">${s.commercial.protein}</td><td class="num-cell">${s.requirements.protein[0]}–${s.requirements.protein[1]}%</td></tr>
          <tr><td>Fat / Lipid (%)</td><td class="num-cell">${t.lipid}</td><td class="num-cell">${s.commercial.lipid}</td><td class="num-cell">${s.requirements.lipid[0]}–${s.requirements.lipid[1]}%</td></tr>
          <tr><td>Crude Fibre (%)</td><td class="num-cell">${t.fiber}</td><td class="num-cell">${s.commercial.fiber}</td><td class="num-cell">≤${s.requirements.fiber[1]}%</td></tr>
          <tr><td>Ash (%)</td><td class="num-cell">${t.ash}</td><td class="num-cell">${s.commercial.ash}</td><td class="num-cell">≤${s.requirements.ash[1]}%</td></tr>
          <tr><td>Moisture (%)</td><td class="num-cell">12.0</td><td class="num-cell">${s.commercial.moisture}</td><td class="num-cell">≤12%</td></tr>
        </tbody>
      </table></div>
    </div>`;
}

// ════════════════════════════════════════════════════════
// CUSTOM FORMULATION BUILDER (Formulations page)
// Lets a farmer build, save, edit, delete and search their own
// feed recipes from the ingredient catalogue. A farmer only ever
// enters each ingredient's % in the diet — Protein/Lipid/Ash/Fiber
// contribution and cost per kg are always calculated automatically
// from the catalogue, with live FAO compliance checking.
// ════════════════════════════════════════════════════════
let cfRows = [];        // current builder rows: { rowId, ingredientId, pct }
let cfNextRowId = 1;
let cfEditingId = null; // null = creating new, else id of formulation being edited

// Adds a new ingredient row, defaulting to the first catalogue ingredient
// that isn't already used elsewhere in the mix. Nutrient composition is
// NEVER typed by hand — it is always looked up live from the ingredient
// catalogue (Ingredients page), so the numbers a farmer sees here are
// guaranteed to match the verified catalogue values.
function addFormulationRow() {
  const errEl = document.getElementById('formulation-error');
  const usedIds  = cfRows.map(r => r.ingredientId);
  const available = ingredients.filter(i => !usedIds.includes(i.id));
  if (available.length === 0) {
    if (errEl) { errEl.textContent = 'Every catalogue ingredient is already in this mix. Add ingredients on the Ingredients page to use more.'; errEl.classList.add('visible'); }
    return;
  }
  if (errEl) errEl.classList.remove('visible');
  cfRows.push({ rowId: cfNextRowId++, ingredientId: available[0].id, pct: 0 });
  updateFormulationCalculations();
}

function removeFormulationRow(rowId) {
  cfRows = cfRows.filter(r => r.rowId !== rowId);
  updateFormulationCalculations();
}

// Called when the ingredient dropdown changes. The row simply switches to
// referencing the newly chosen catalogue ingredient — its Protein/Lipid/
// Ash/Fiber composition is looked up automatically wherever it's needed,
// so there is nothing for the farmer to type or get wrong. Picking an
// ingredient that's already used in another row is blocked so the same
// ingredient can never be double-counted in one mix.
function updateFormulationRowIngredient(rowId, value) {
  const row  = cfRows.find(r => r.rowId === rowId);
  const errEl = document.getElementById('formulation-error');
  if (!row) return;
  const newId = parseInt(value, 10);
  if (cfRows.some(r => r.rowId !== rowId && r.ingredientId === newId)) {
    if (errEl) { errEl.textContent = 'That ingredient is already in this mix — remove the other row first if you want to change it.'; errEl.classList.add('visible'); }
    updateFormulationCalculations(); // re-render resets the <select> back to the row's actual ingredient
    return;
  }
  if (errEl) errEl.classList.remove('visible');
  row.ingredientId = newId;
  updateFormulationCalculations();
}

// The only value a farmer ever types by hand in a row: how much of the
// diet (by %) this catalogue ingredient makes up.
function updateFormulationRowPct(rowId, value) {
  const row = cfRows.find(r => r.rowId === rowId);
  if (!row) return;
  let v = parseFloat(value);
  if (isNaN(v) || v < 0) v = 0;
  if (v > 100) v = 100;
  row.pct = v;
  updateFormulationCalculations();
}

// Single source of truth for every number in the builder. Each row's
// Protein/Lipid/Ash/Fiber is read straight from the ingredient catalogue
// (never from the row itself), then weighted by that row's % in the diet
// to get its "percentage point" (pp) contribution. Summing the pp
// contributions across all rows gives the formulation's total nutrient
// profile — the same weighted-average method used by the fixed FAO
// reference recipes above, so a farmer's saved mix is calculated exactly
// the same way as the validated Fry/Juvenile/Grower recipes.
function calcFormulationTotals() {
  let totalPct = 0, totalProtein = 0, totalLipid = 0, totalAsh = 0, totalFiber = 0, totalCostPerKg = 0;
  const rows = cfRows.map(row => {
    const ing     = ingredients.find(i => i.id === row.ingredientId) || null;
    const pct     = row.pct || 0;
    const protein = ing ? ing.protein : 0;
    const lipid   = ing ? ing.lipid   : 0;
    const ash     = ing ? ing.ash     : 0;
    const fiber   = ing ? ing.fiber   : 0;
    const price   = ing ? ing.price   : 0;
    const proteinPP = protein * pct / 100;
    const lipidPP   = lipid   * pct / 100;
    const ashPP     = ash     * pct / 100;
    const fiberPP   = fiber   * pct / 100;
    const costPP    = price   * pct / 100; // USD per kg of finished feed contributed by this ingredient
    totalPct += pct;
    totalProtein += proteinPP; totalLipid += lipidPP; totalAsh += ashPP; totalFiber += fiberPP;
    totalCostPerKg += costPP;
    return { row, ing, pct, protein, lipid, ash, fiber, price, proteinPP, lipidPP, ashPP, fiberPP, costPP };
  });
  return { rows, totalPct, totalProtein, totalLipid, totalAsh, totalFiber, totalCostPerKg };
}

// Renders the builder table: Ingredient (catalogue dropdown only — no
// free-typed composition) | % in Diet (the only manual input) | the
// resulting Protein/Lipid/Ash/Fiber percentage-point contribution,
// computed automatically | Remove — plus a live TOTAL row. A muted
// reference line under each ingredient shows its raw catalogue
// composition, so a farmer always sees where the numbers come from.
function updateFormulationCalculations() {
  const body     = document.getElementById('cf-calc-body');
  const totalsEl = document.getElementById('cf-calc-totals');
  if (!body || !totalsEl) return;

  const calc = calcFormulationTotals();
  const pctFieldStyle = 'width:80px;text-align:right;border:1.5px solid var(--border);border-radius:6px;padding:6px 8px;font-size:13px;font-weight:700;';

  body.innerHTML = cfRows.length === 0
    ? `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:16px;">No ingredients yet — click "Add Ingredient" to start building your mix.</td></tr>`
    : calc.rows.map(r => {
        const row = r.row, ing = r.ing;
        const usedElsewhere = cfRows.filter(rr => rr.rowId !== row.rowId).map(rr => rr.ingredientId);
        const selectableIngredients = ingredients.filter(i => !usedElsewhere.includes(i.id));
        let optionsHtml = selectableIngredients
          .map(i => `<option value="${i.id}" ${i.id === row.ingredientId ? 'selected' : ''}>${i.name}</option>`)
          .join('');
        if (!ing) {
          optionsHtml = `<option value="${row.ingredientId}" selected disabled>⚠ Ingredient no longer in catalogue</option>` + optionsHtml;
        }
        return `<tr>
        <td>
          <select onchange="updateFormulationRowIngredient(${row.rowId}, this.value)"
            style="border:1.5px solid var(--border);border-radius:6px;padding:6px 10px;font-size:13px;color:var(--ink);background:var(--white);width:100%;min-width:170px;font-weight:600;">
            ${optionsHtml}
          </select>
          <div style="font-size:11px;color:var(--muted);margin-top:4px;">
            ${ing ? `Catalogue: Protein ${ing.protein}% · Lipid ${ing.lipid}% · Ash ${ing.ash}% · Fiber ${ing.fiber}%` : 'This ingredient was removed from the catalogue — pick a replacement.'}
          </div>
        </td>
        <td class="num-cell">
          <input type="number" value="${row.pct}" step="0.1" min="0" max="100"
            oninput="updateFormulationRowPct(${row.rowId}, this.value)" style="${pctFieldStyle}">
        </td>
        <td class="num-cell">${r.proteinPP.toFixed(2)}</td>
        <td class="num-cell">${r.lipidPP.toFixed(2)}</td>
        <td class="num-cell">${r.ashPP.toFixed(2)}</td>
        <td class="num-cell">${r.fiberPP.toFixed(2)}</td>
        <td class="num-cell">$${r.costPP.toFixed(3)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removeFormulationRow(${row.rowId})" title="Remove this ingredient">🗑 Remove</button></td>
      </tr>`;
      }).join('');

  const pctColor = Math.abs(calc.totalPct - 100) < 0.01 ? 'var(--pass)' : 'var(--fail)';
  totalsEl.innerHTML = cfRows.length === 0 ? '' : `<tr class="total-row">
    <td>TOTAL</td>
    <td class="num-cell" style="color:${pctColor};">${calc.totalPct.toFixed(2)}%</td>
    <td class="num-cell">${calc.totalProtein.toFixed(2)}</td>
    <td class="num-cell">${calc.totalLipid.toFixed(2)}</td>
    <td class="num-cell">${calc.totalAsh.toFixed(2)}</td>
    <td class="num-cell">${calc.totalFiber.toFixed(2)}</td>
    <td class="num-cell">$${calc.totalCostPerKg.toFixed(3)} /kg</td>
    <td></td>
  </tr>`;

  const stageEl  = document.getElementById('cf-stage');
  const stageKey = stageEl ? stageEl.value : 'fry';
  const req = FAO_RANGES[stageKey];
  const complianceEl = document.getElementById('cf-compliance');
  if (complianceEl && req) {
    const nutrients = [
      { label:'Protein',     val: calc.totalProtein, range: req.protein },
      { label:'Lipid/Fat',   val: calc.totalLipid,   range: req.lipid   },
      { label:'Ash',         val: calc.totalAsh,     range: req.ash     },
      { label:'Crude Fibre', val: calc.totalFiber,   range: req.fiber   },
    ];
    const pctOk   = Math.abs(calc.totalPct - 100) < 0.01;
    const allPass = pctOk && nutrients.every(n => checkNutrient(n.val, n.range) === 'pass');
    const verdict = !pctOk
      ? `<div class="verdict fail"><span class="verdict-icon">⚠️</span> Ingredient percentages must total 100% before this formulation can be evaluated (currently ${calc.totalPct.toFixed(2)}%).</div>`
      : allPass
        ? `<div class="verdict pass"><span class="verdict-icon">✔️</span> This formulation MEETS FAO requirements for the ${stageKey} stage.</div>`
        : `<div class="verdict fail"><span class="verdict-icon">⚠️</span> One or more nutrients fall outside FAO requirements for the ${stageKey} stage – review highlighted items.</div>`;
    const items = nutrients.map(n => {
      const status = checkNutrient(n.val, n.range);
      const icons  = { pass:'✔ COMPLIANT', warn:'≈ BORDERLINE', fail:'✖ OUT OF RANGE' };
      const maxLbl = n.range[0] === 0 ? `≤ ${n.range[1]}%` : `${n.range[0]}–${n.range[1]}%`;
      return `<div class="comp-item ${status}">
        <div class="comp-label">${n.label}</div>
        <div class="comp-value">${n.val.toFixed(2)}%</div>
        <div class="comp-range">FAO: ${maxLbl}</div>
        <div class="comp-status">${icons[status]}</div>
      </div>`;
    }).join('');
    complianceEl.innerHTML = verdict + `<div class="compliance-grid">${items}</div>`;
  }
}

function resetFormulationBuilder() {
  cfEditingId = null;
  cfRows = [];
  const nameEl  = document.getElementById('cf-name');
  const stageEl = document.getElementById('cf-stage');
  const weightEl = document.getElementById('cf-weight');
  const titleEl = document.getElementById('builder-title');
  const cancelEl = document.getElementById('cf-cancel-btn');
  const errEl   = document.getElementById('formulation-error');
  if (nameEl)  nameEl.value  = '';
  if (stageEl) stageEl.value = 'fry';
  if (weightEl) weightEl.value = '';
  if (titleEl) titleEl.textContent = '➕ New Formulation';
  if (cancelEl) cancelEl.style.display = 'none';
  if (errEl) errEl.classList.remove('visible');
  updateFormulationCalculations();
}

function saveCustomFormulation() {
  const errEl = document.getElementById('formulation-error');
  const name  = document.getElementById('cf-name').value.trim();
  const stage = document.getElementById('cf-stage').value;
  const weight = parseFloat(document.getElementById('cf-weight').value);
  const calc  = calcFormulationTotals();

  if (!name) {
    errEl.textContent = 'Formulation name is required.';
    errEl.classList.add('visible');
    return;
  }
  if (!weight || weight <= 0) {
    errEl.textContent = 'Batch weight (kg) is required and must be greater than 0.';
    errEl.classList.add('visible');
    return;
  }
  if (cfRows.length === 0) {
    errEl.textContent = 'Add at least one ingredient to the mix.';
    errEl.classList.add('visible');
    return;
  }
  const missingPct = cfRows.some(r => !r.pct || r.pct <= 0);
  if (missingPct) {
    errEl.textContent = 'Every ingredient needs a % in diet greater than 0.';
    errEl.classList.add('visible');
    return;
  }
  if (Math.abs(calc.totalPct - 100) > 0.01) {
    errEl.textContent = `Ingredient percentages must total 100% (currently ${calc.totalPct.toFixed(2)}%).`;
    errEl.classList.add('visible');
    return;
  }
  errEl.classList.remove('visible');

  const existing = cfEditingId ? customFormulations.find(f => f.id === cfEditingId) : null;
  const record = {
    id: cfEditingId || nextFormulationId++,
    name, stage, weight,
    // Composition is snapshotted from the catalogue at save time, so a
    // saved formulation stays accurate even if that ingredient is later
    // edited or removed from the catalogue.
    ingredients: calc.rows.map(r => ({
      ingredientId: r.row.ingredientId,
      name:    r.ing ? r.ing.name : 'Unknown ingredient',
      pct:     r.pct,
      protein: r.protein,
      lipid:   r.lipid,
      ash:     r.ash,
      fiber:   r.fiber,
      price:   r.price,
    })),
    totalProtein: calc.totalProtein,
    totalLipid:   calc.totalLipid,
    totalAsh:     calc.totalAsh,
    totalFiber:   calc.totalFiber,
    totalCostPerKg: calc.totalCostPerKg,
    totalBatchCost: calc.totalCostPerKg * weight,
    createdDate:  existing ? existing.createdDate : new Date().toISOString().slice(0, 10),
  };

  if (cfEditingId) {
    customFormulations = customFormulations.map(f => f.id === cfEditingId ? record : f);
  } else {
    customFormulations.push(record);
  }

  if (firebaseReady && db) {
    db.collection('formulations').doc(String(record.id)).set(record)
      .then(() => console.log('✅ Formulation saved to Firestore.'))
      .catch(e => console.error('❌ Firebase write failed:', e));
  }

  resetFormulationBuilder();
  renderSavedFormulations();
}

function editCustomFormulation(id) {
  const f = customFormulations.find(x => x.id === id);
  if (!f) return;
  cfEditingId = id;
  cfRows = f.ingredients.map(ing => ({
    rowId: cfNextRowId++,
    ingredientId: ing.ingredientId,
    pct: ing.pct,
  }));

  document.getElementById('cf-name').value  = f.name;
  document.getElementById('cf-stage').value = f.stage;
  document.getElementById('cf-weight').value = f.weight || '';
  document.getElementById('builder-title').textContent = `✏️ Editing: ${f.name}`;
  document.getElementById('cf-cancel-btn').style.display = 'inline-block';

  updateFormulationCalculations();
  document.getElementById('builder-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteCustomFormulation(id) {
  const f = customFormulations.find(x => x.id === id);
  showModal(
    'Delete Formulation',
    `Delete <strong>${f ? f.name : 'this formulation'}</strong>? This cannot be undone.`,
    () => {
      customFormulations = customFormulations.filter(x => x.id !== id);
      if (firebaseReady && db) {
        db.collection('formulations').doc(String(id)).delete()
          .catch(e => console.error('❌ Firebase delete failed:', e));
      }
      if (cfEditingId === id) resetFormulationBuilder();
      const panel = document.getElementById('cf-view-panel');
      if (panel) panel.innerHTML = '';
      renderSavedFormulations();
    }
  );
}

function viewCustomFormulation(id) {
  const f = customFormulations.find(x => x.id === id);
  const panel = document.getElementById('cf-view-panel');
  if (!f || !panel) return;

  const req = FAO_RANGES[f.stage];
  const rows = f.ingredients.map(entry => {
    const name   = entry.name || (ingredients.find(i => i.id === entry.ingredientId)?.name) || 'Unnamed ingredient';
    const costPP = (entry.price || 0) * entry.pct / 100;
    return `<tr>
      <td>${name}</td>
      <td class="num-cell">${entry.pct.toFixed(2)}</td>
      <td class="num-cell">${entry.protein.toFixed(2)}</td>
      <td class="num-cell">${entry.lipid.toFixed(2)}</td>
      <td class="num-cell">${entry.ash.toFixed(2)}</td>
      <td class="num-cell">${entry.fiber.toFixed(2)}</td>
      <td class="num-cell">$${costPP.toFixed(3)}</td>
    </tr>`;
  }).join('');

  const nutrients = req ? [
    { label:'Protein',     val: f.totalProtein, range: req.protein },
    { label:'Lipid/Fat',   val: f.totalLipid,   range: req.lipid   },
    { label:'Ash',         val: f.totalAsh,     range: req.ash     },
    { label:'Crude Fibre', val: f.totalFiber,   range: req.fiber   },
  ] : [];
  const items = nutrients.map(n => {
    const status = checkNutrient(n.val, n.range);
    const icons  = { pass:'✔ COMPLIANT', warn:'≈ BORDERLINE', fail:'✖ OUT OF RANGE' };
    const maxLbl = n.range[0] === 0 ? `≤ ${n.range[1]}%` : `${n.range[0]}–${n.range[1]}%`;
    return `<div class="comp-item ${status}">
      <div class="comp-label">${n.label}</div>
      <div class="comp-value">${n.val.toFixed(2)}%</div>
      <div class="comp-range">FAO: ${maxLbl}</div>
      <div class="comp-status">${icons[status]}</div>
    </div>`;
  }).join('');

  const stageLbl = { fry:'🥚 Fry (0–5 g)', juvenile:'🐟 Juvenile (5–50 g)', grower:'🐠 Grower (>50 g)' }[f.stage] || f.stage;

  panel.innerHTML = `
    <div class="card">
      <div class="card-title">👁️ Viewing: ${f.name}
        <button class="btn btn-primary btn-sm" style="margin-left:auto;" onclick="document.getElementById('cf-view-panel').innerHTML=''">Close</button>
      </div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px;">
        Stage: ${stageLbl} &nbsp;·&nbsp; Batch Weight: <strong style="color:var(--teal-deep);">${f.weight ? f.weight.toFixed(1) + ' kg' : '–'}</strong> &nbsp;·&nbsp;
        Cost: <strong style="color:var(--teal-deep);">$${(f.totalCostPerKg || 0).toFixed(3)} / kg</strong>${f.weight ? ` (≈ $${(f.totalBatchCost || f.totalCostPerKg * f.weight).toFixed(2)} total)` : ''} &nbsp;·&nbsp; Created: ${f.createdDate}
      </p>
      <div class="tbl-wrap"><table>
        <thead><tr>
          <th>Ingredient</th><th class="num-cell">% in Diet</th>
          <th class="num-cell">Protein (pp)</th><th class="num-cell">Lipid (pp)</th>
          <th class="num-cell">Ash (pp)</th><th class="num-cell">Fiber (pp)</th>
          <th class="num-cell">Cost (USD/kg)</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="compliance-grid" style="margin-top:16px;">${items}</div>
    </div>`;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSavedFormulations() {
  const body = document.getElementById('cf-saved-body');
  if (!body) return;
  const searchEl = document.getElementById('cf-search');
  const query = searchEl ? searchEl.value.trim().toLowerCase() : '';
  const filtered = customFormulations.filter(f => f.name.toLowerCase().includes(query));

  body.innerHTML = filtered.length === 0
    ? `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:20px;">${customFormulations.length === 0 ? 'No custom formulations saved yet — build one above.' : 'No formulations match your search.'}</td></tr>`
    : filtered.map(f => {
        const req = FAO_RANGES[f.stage];
        const nutrients = req ? [
          { val: f.totalProtein, range: req.protein }, { val: f.totalLipid, range: req.lipid },
          { val: f.totalAsh,     range: req.ash },     { val: f.totalFiber, range: req.fiber },
        ] : [];
        const allPass = nutrients.length > 0 && nutrients.every(n => checkNutrient(n.val, n.range) === 'pass');
        const anyFail = nutrients.some(n => checkNutrient(n.val, n.range) === 'fail');
        const badge = allPass
          ? `<span class="badge" style="color:var(--pass);background:var(--pass-bg);">✔ Compliant</span>`
          : anyFail
            ? `<span class="badge" style="color:var(--fail);background:var(--fail-bg);">✖ Out of range</span>`
            : `<span class="badge" style="color:var(--warn);background:var(--warn-bg);">≈ Borderline</span>`;
        const stageLbl = { fry:'🥚 Fry', juvenile:'🐟 Juvenile', grower:'🐠 Grower' }[f.stage] || f.stage;
        return `<tr>
          <td>${f.name}</td>
          <td>${stageLbl}</td>
          <td class="num-cell">${f.weight ? f.weight.toFixed(1) + ' kg' : '–'}</td>
          <td class="num-cell">$${(f.totalCostPerKg || 0).toFixed(3)} /kg</td>
          <td class="num-cell">${f.totalProtein.toFixed(2)}%</td>
          <td>${badge}</td>
          <td style="white-space:nowrap;">
            <button class="btn btn-success btn-sm" onclick="viewCustomFormulation(${f.id})">View</button>
            <button class="btn btn-primary btn-sm" onclick="editCustomFormulation(${f.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCustomFormulation(${f.id})">Delete</button>
          </td>
        </tr>`;
      }).join('');
}

function fetchPersistedFormulations() {
  if (firebaseReady && db) {
    db.collection('formulations').get()
      .then(snapshot => {
        if (!snapshot.empty) {
          let loaded = [];
          let maxId = 0;
          snapshot.forEach(doc => {
            const data = doc.data();
            loaded.push(data);
            if (data.id > maxId) maxId = data.id;
          });
          customFormulations = loaded;
          nextFormulationId = maxId + 1;
          console.log('✅ Formulations loaded from Firestore.');
        }
        renderSavedFormulations();
      })
      .catch(err => {
        console.error('❌ Failed to load formulations:', err);
        renderSavedFormulations();
      });
  } else {
    renderSavedFormulations();
  }
}


function renderIngredientTable() {
  const searchEl  = document.getElementById('ingr-search');
  const stockEl   = document.getElementById('ingr-filter-stock');
  const sortEl    = document.getElementById('ingr-sort');
  const infoEl    = document.getElementById('ingr-filter-info');

  const query     = searchEl  ? searchEl.value.trim().toLowerCase()  : '';
  const stockFilter = stockEl ? stockEl.value  : 'all';
  const sortBy    = sortEl    ? sortEl.value    : 'name';

  let filtered = ingredients.filter(ing => {
    const matchName  = ing.name.toLowerCase().includes(query);
    const matchStock = stockFilter === 'all'
      ? true
      : stockFilter === 'low'  ? ing.stock < 5
      : ing.stock >= 5;
    return matchName && matchStock;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'protein') return b.protein - a.protein;
    if (sortBy === 'price')   return b.price   - a.price;
    if (sortBy === 'stock')   return b.stock   - a.stock;
    return a.name.localeCompare(b.name);
  });

  // Show result count info when filters are active
  const isFiltered = query || stockFilter !== 'all' || sortBy !== 'name';
  if (infoEl) {
    if (isFiltered) {
      infoEl.textContent = `Showing ${filtered.length} of ${ingredients.length} ingredient${ingredients.length !== 1 ? 's' : ''}`;
      infoEl.style.display = 'block';
    } else {
      infoEl.style.display = 'none';
    }
  }

  document.getElementById('ingr-table-body').innerHTML = filtered.length === 0
    ? `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:24px;">No ingredients match your search.</td></tr>`
    : filtered.map(ing => `<tr>
    <td>${ing.name}</td>
    <td class="num-cell">${ing.protein.toFixed(1)}</td>
    <td class="num-cell">${ing.lipid.toFixed(1)}</td>
    <td class="num-cell">${ing.ash.toFixed(1)}</td>
    <td class="num-cell">${ing.fiber.toFixed(1)}</td>
    <td class="num-cell">${ing.price.toFixed(2)}</td>
    <td class="num-cell">
      <span style="color:${ing.stock < 5 ? 'var(--fail)' : 'var(--pass)'};font-weight:700;">
        ${ing.stock.toFixed(1)} kg
      </span>
    </td>
    <td style="white-space:nowrap;">
      <button class="btn btn-primary btn-sm" onclick="editIngredient(${ing.id})">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteIngredient(${ing.id})">Delete</button>
    </td>
  </tr>`).join('');
}

function clearIngrFilters() {
  const s = document.getElementById('ingr-search');
  const f = document.getElementById('ingr-filter-stock');
  const o = document.getElementById('ingr-sort');
  if (s) s.value = '';
  if (f) f.value = 'all';
  if (o) o.value = 'name';
  renderIngredientTable();
}

// ════════════════════════════════════════════════════════
// FIXED: Real-time Cloud Firestore synchronization functions
// ════════════════════════════════════════════════════════
let ingrEditingId = null; // null = adding new, else id of ingredient being edited

function addIngredient() {
  const errEl = document.getElementById('ingr-error');
  const name  = document.getElementById('ingr-name').value.trim();
  if (!name) { errEl.textContent = 'Ingredient name is required.'; errEl.classList.add('visible'); document.getElementById('ingr-name').focus(); return; }
  errEl.classList.remove('visible');

  const fields = {
    name,
    protein: parseFloat(document.getElementById('ingr-protein').value) || 0,
    lipid:   parseFloat(document.getElementById('ingr-lipid').value)   || 0,
    ash:     parseFloat(document.getElementById('ingr-ash').value)     || 0,
    fiber:   parseFloat(document.getElementById('ingr-fiber').value)   || 0,
    price:   parseFloat(document.getElementById('ingr-price').value)   || 0,
    stock:   parseFloat(document.getElementById('ingr-stock').value)   || 0,
  };

  if (ingrEditingId) {
    // 1. Update locally
    const idx = ingredients.findIndex(i => i.id === ingrEditingId);
    const updatedIng = { ...ingredients[idx], ...fields, id: ingrEditingId };
    if (idx !== -1) ingredients[idx] = updatedIng;

    // 2. Persist the update to Firestore
    if (firebaseReady && db) {
      db.collection('ingredients').doc(String(updatedIng.id)).set(updatedIng)
        .then(() => console.log('✅ Ingredient updated in remote Firebase instance successfully.'))
        .catch(e => console.error('❌ Firebase active write execution error occurred:', e));
    }

    cancelEditIngredient();
  } else {
    const newIng = { id: nextId++, ...fields };

    // 1. Push locally
    ingredients.push(newIng);

    // 2. Persist safely straight to remote Firestore tracking matching string keys
    if (firebaseReady && db) {
      db.collection('ingredients').doc(String(newIng.id)).set(newIng)
        .then(() => console.log('✅ New ingredient saved to remote Firebase instance successfully.'))
        .catch(e => console.error('❌ Firebase active write execution error occurred:', e));
    }

    ['ingr-name','ingr-protein','ingr-lipid','ingr-ash','ingr-fiber','ingr-price','ingr-stock']
      .forEach(id => document.getElementById(id).value = '');
  }

  renderIngredientTable();
}

function editIngredient(id) {
  const ing = ingredients.find(i => i.id === id);
  if (!ing) return;
  ingrEditingId = id;

  document.getElementById('ingr-name').value    = ing.name;
  document.getElementById('ingr-protein').value = ing.protein;
  document.getElementById('ingr-lipid').value   = ing.lipid;
  document.getElementById('ingr-ash').value     = ing.ash;
  document.getElementById('ingr-fiber').value   = ing.fiber;
  document.getElementById('ingr-price').value   = ing.price;
  document.getElementById('ingr-stock').value   = ing.stock;

  const errEl = document.getElementById('ingr-error');
  if (errEl) errEl.classList.remove('visible');

  const titleEl  = document.getElementById('ingr-form-title');
  const submitEl = document.getElementById('ingr-submit-btn');
  const cancelEl = document.getElementById('ingr-cancel-btn');
  if (titleEl)  titleEl.textContent = `✏️ Editing: ${ing.name}`;
  if (submitEl) submitEl.textContent = '💾 Update Ingredient';
  if (cancelEl) cancelEl.style.display = 'inline-block';

  titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEditIngredient() {
  ingrEditingId = null;
  const titleEl  = document.getElementById('ingr-form-title');
  const submitEl = document.getElementById('ingr-submit-btn');
  const cancelEl = document.getElementById('ingr-cancel-btn');
  const errEl    = document.getElementById('ingr-error');
  if (titleEl)  titleEl.textContent = '➕ Add / Update Ingredient';
  if (submitEl) submitEl.textContent = '➕ Add Ingredient';
  if (cancelEl) cancelEl.style.display = 'none';
  if (errEl) errEl.classList.remove('visible');
  ['ingr-name','ingr-protein','ingr-lipid','ingr-ash','ingr-fiber','ingr-price','ingr-stock']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function deleteIngredient(id) {
  const ing = ingredients.find(i => i.id === id);
  showModal(
    'Remove Ingredient',
    `Remove <strong>${ing ? ing.name : 'this ingredient'}</strong> from the database?`,
    () => {
      // 1. Filter local state
      ingredients = ingredients.filter(i => i.id !== id);
      
      // 2. Issue document elimination to matching document storage
      if (firebaseReady && db) {
        db.collection('ingredients').doc(String(id)).delete()
          .then(() => console.log(`🗑️ Deleted document tracking id ${id} remotely.`))
          .catch(e => console.error('❌ Firebase sync processing delete failure:', e));
      }
      if (ingrEditingId === id) cancelEditIngredient();
      renderIngredientTable();
    }
  );
}

function renderProduction() {
  const totalBatches = productionRecords.length;
  const totalKg      = productionRecords.reduce((s,r) => s + r.batchKg, 0);
  const avgFCR       = productionRecords.filter(r => r.fcr > 0).reduce((s,r,_,a) => s + r.fcr/a.length, 0);
  const lastFish     = productionRecords.length ? productionRecords[productionRecords.length-1].fishKg : 0;

  document.getElementById('prod-kpi-grid').innerHTML = `
    <div class="prod-kpi"><div class="kpi-val">${totalBatches}</div><div class="kpi-unit">batches</div><div class="kpi-lbl">Total Batches</div></div>
    <div class="prod-kpi"><div class="kpi-val">${totalKg.toFixed(0)}</div><div class="kpi-unit">kg</div><div class="kpi-lbl">Feed Produced</div></div>
    <div class="prod-kpi"><div class="kpi-val">${avgFCR > 0 ? avgFCR.toFixed(2) : '–'}</div><div class="kpi-unit">avg FCR</div><div class="kpi-lbl">Feed Conversion</div></div>
    <div class="prod-kpi"><div class="kpi-val">${lastFish.toFixed(1)}</div><div class="kpi-unit">kg</div><div class="kpi-lbl">Latest Fish Biomass</div></div>`;

  const stageBadge = s => {
    const map = {Fry:'fry', Juvenile:'juvenile', Grower:'grower'};
    return `<span class="badge badge-${map[s]||'fry'}">${s}</span>`;
  };
  const fcrColor = f => f <= 1.2 ? 'var(--pass)' : f <= 1.6 ? 'var(--teal-mid)' : f <= 2.0 ? 'var(--warn)' : 'var(--fail)';

  document.getElementById('prod-table-body').innerHTML = productionRecords.length === 0
    ? `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:20px;">No records yet.</td></tr>`
    : [...productionRecords].reverse().map(r => `<tr>
        <td>${r.id}</td><td>${r.date}</td><td>${stageBadge(r.stage)}</td>
        <td class="num-cell">${r.batchKg.toFixed(1)} kg</td>
        <td class="num-cell" style="font-weight:700;color:${fcrColor(r.fcr)}">${r.fcr > 0 ? r.fcr.toFixed(2) : '–'}</td>
        <td class="num-cell">${r.fishKg > 0 ? r.fishKg.toFixed(1)+' kg' : '–'}</td>
        <td style="font-size:12px;color:var(--muted);">${r.notes || '–'}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-primary btn-sm" onclick="editProdRecord(${r.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProdRecord(${r.id})">Delete</button>
        </td>
      </tr>`).join('');
}

let prodEditingId = null; // null = adding new, else id of production record being edited

function addProductionRecord() {
  const errEl   = document.getElementById('prod-error');
  const date    = document.getElementById('prod-date').value;
  const stage   = document.getElementById('prod-stage').value;
  const batchKg = parseFloat(document.getElementById('prod-batch').value);
  if (!date || !stage || !batchKg || batchKg <= 0) { errEl.classList.add('visible'); return; }
  errEl.classList.remove('visible');

  const fields = {
    date, stage, batchKg,
    fcr:     parseFloat(document.getElementById('prod-fcr').value)    || 0,
    fishKg:  parseFloat(document.getElementById('prod-fishkg').value) || 0,
    notes:   document.getElementById('prod-notes').value.trim(),
  };

  if (prodEditingId) {
    const idx = productionRecords.findIndex(r => r.id === prodEditingId);
    const updatedRec = { ...productionRecords[idx], ...fields, id: prodEditingId };
    if (idx !== -1) productionRecords[idx] = updatedRec;

    if (firebaseReady && db) {
      db.collection('productionRecords').doc(String(updatedRec.id)).set(updatedRec)
        .catch(e => console.error('Firebase write failed:', e));
    }

    cancelEditProdRecord();
  } else {
    const rec = { id: nextProdId++, ...fields };
    productionRecords.push(rec);
    if (firebaseReady && db) {
      db.collection('productionRecords').doc(String(rec.id)).set(rec)
        .catch(e => console.error('Firebase write failed:', e));
    }
    ['prod-date','prod-stage','prod-batch','prod-fcr','prod-fishkg','prod-notes']
      .forEach(id => { document.getElementById(id).value = ''; });
  }

  renderProduction();
}

function editProdRecord(id) {
  const rec = productionRecords.find(r => r.id === id);
  if (!rec) return;
  prodEditingId = id;

  document.getElementById('prod-date').value    = rec.date;
  document.getElementById('prod-stage').value   = rec.stage;
  document.getElementById('prod-batch').value   = rec.batchKg;
  document.getElementById('prod-fcr').value     = rec.fcr || '';
  document.getElementById('prod-fishkg').value  = rec.fishKg || '';
  document.getElementById('prod-notes').value   = rec.notes || '';

  const errEl = document.getElementById('prod-error');
  if (errEl) errEl.classList.remove('visible');

  const titleEl  = document.getElementById('prod-form-title');
  const submitEl = document.getElementById('prod-submit-btn');
  const cancelEl = document.getElementById('prod-cancel-btn');
  if (titleEl)  titleEl.textContent = `✏️ Editing: Batch #${rec.id}`;
  if (submitEl) submitEl.textContent = '💾 Update Record';
  if (cancelEl) cancelEl.style.display = 'inline-block';

  titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEditProdRecord() {
  prodEditingId = null;
  const titleEl  = document.getElementById('prod-form-title');
  const submitEl = document.getElementById('prod-submit-btn');
  const cancelEl = document.getElementById('prod-cancel-btn');
  const errEl    = document.getElementById('prod-error');
  if (titleEl)  titleEl.textContent = '➕ Log New Production Batch';
  if (submitEl) submitEl.textContent = '➕ Add Record';
  if (cancelEl) cancelEl.style.display = 'none';
  if (errEl) errEl.classList.remove('visible');
  ['prod-date','prod-stage','prod-batch','prod-fcr','prod-fishkg','prod-notes']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function deleteProdRecord(id) {
  showModal(
    'Delete Production Record',
    `Delete batch record <strong>#${id}</strong>? This cannot be undone.`,
    () => {
      productionRecords = productionRecords.filter(r => r.id !== id);
      if (firebaseReady && db) {
        db.collection('productionRecords').doc(String(id)).delete()
          .then(() => console.log(`🗑️ Deleted production record ${id} from Firestore.`))
          .catch(e => console.error('Firebase delete failed:', e));
      }
      if (prodEditingId === id) cancelEditProdRecord();
      renderProduction();
    }
  );
}

// Loads production records from Firestore on page load, the same way
// fetchPersistedIngredients() does for the ingredient catalogue. Without
// this, the page always fell back to rendering the hardcoded seed array
// from acgrow-database.js on every refresh — which is why deleted records
// kept reappearing (Firestore was updated, but nothing ever read it back).
//
// If Firestore's productionRecords collection is still empty (e.g. nobody
// has triggered a sync yet), we seed it with the current in-memory records
// so that from this point forward Firestore is the real source of truth
// and deletes/edits persist correctly across refreshes.
function fetchPersistedProductionRecords() {
  if (firebaseReady && db) {
    console.log("📥 Fetching saved production records from Cloud Firestore...");
    db.collection('productionRecords').get()
      .then(snapshot => {
        if (!snapshot.empty) {
          let loaded = [];
          let maxId = 0;
          snapshot.forEach(doc => {
            const data = doc.data();
            loaded.push(data);
            if (data.id > maxId) maxId = data.id;
          });
          loaded.sort((a, b) => a.id - b.id);
          productionRecords = loaded;
          nextProdId = maxId + 1;
          console.log('✅ Production records loaded from Firestore.');
          renderProduction();
        } else {
          console.log('ℹ️ No production records found in Firestore. Seeding defaults…');
          const batch = db.batch();
          productionRecords.forEach(rec => {
            batch.set(db.collection('productionRecords').doc(String(rec.id)), rec);
          });
          batch.commit()
            .then(() => console.log('✅ Seeded default production records to Firestore.'))
            .catch(e => console.error('❌ Failed to seed production records:', e))
            .finally(() => renderProduction());
        }
      })
      .catch(error => {
        console.error("❌ Failed to pull remote production records:", error);
        renderProduction();
      });
  } else {
    renderProduction();
  }
}

let _modalCallback = null;

function showModal(title, msg, onConfirm) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMsg').innerHTML     = msg;
  document.getElementById('confirmModal').classList.add('open');
  _modalCallback = onConfirm;
}

function closeModal() {
  document.getElementById('confirmModal').classList.remove('open');
  _modalCallback = null;
}

document.getElementById('modalConfirmBtn').addEventListener('click', () => {
  if (_modalCallback) _modalCallback();
  closeModal();
});

document.getElementById('confirmModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ════════════════════════════════════════════════════════
// PAGE BOOTSTRAP
// Each HTML page sets `const CURRENT_PAGE = '...'` in a small
// inline <script> BEFORE loading this file, so only the
// elements that actually exist on that page get rendered.
// ════════════════════════════════════════════════════════
function initPage() {
  if (typeof CURRENT_PAGE === 'undefined') return;
  if (CURRENT_PAGE === 'dashboard')    renderDashboard();
  if (CURRENT_PAGE === 'formulations') {
    renderFormulation(currentStage);   // fixed FAO reference recipes
    resetFormulationBuilder();         // empty custom-formulation builder
    fetchPersistedFormulations();      // load farmer-saved formulations
  }
  if (CURRENT_PAGE === 'ingredients')  renderIngredientTable();
  if (CURRENT_PAGE === 'production')   fetchPersistedProductionRecords();
}

function fetchPersistedIngredients() {
  if (firebaseReady && db) {
    console.log("📥 Fetching saved ingredients from Cloud Firestore...");
    db.collection('ingredients').get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          let firestoreIngredients = [];
          let maxId = 9;
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            firestoreIngredients.push(data);
            if (data.id > maxId) maxId = data.id;
          });
          
          ingredients = firestoreIngredients;
          nextId = maxId + 1;
          console.log("✅ Ingredients loaded from Firestore successfully.");
          initPage();
        } else {
          console.log("ℹ️ No ingredients found in Firestore. Seeding defaults…");
          const batch = db.batch();
          ingredients.forEach(ing => {
            batch.set(db.collection('ingredients').doc(String(ing.id)), ing);
          });
          batch.commit()
            .then(() => console.log('✅ Seeded default ingredients to Firestore.'))
            .catch(e => console.error('❌ Failed to seed ingredients:', e))
            .finally(() => initPage());
        }
      })
      .catch((error) => {
        console.error("❌ Failed to pull remote ingredients:", error);
        initPage();
      });
  } else {
    initPage();
  }
}

fetchPersistedIngredients();
