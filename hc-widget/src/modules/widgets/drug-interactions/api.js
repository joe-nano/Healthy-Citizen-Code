import { fetchInteractionsByRxCuis } from '../../../lib/api/drug-interactions/drug-interactions';
import { fetchMedicationsFromUserPreferencesOrMedicationStatement } from '../../../lib/api/medications/medications-from-preferences-or-medication-statement';
import { get } from '../../../lib/utils/utils';
import { userPreferencesFromInlineDataSource } from '../../../lib/api/medications/inline-datasources'

export function fetchDrugInteractions(options) {
  return fetchMedications(options)
    .then(({ medications }) => {
      const rxcuis = medications.map(m => m.rxcui).flat();
      return fetchInteractionsByRxCuis(rxcuis);
    })
    .then(makeDrugInteractionPair)
    .catch(err => {
      console.log(err);

      return {
        list: [],
        count: 0,
      };
    });
}

function fetchMedications(options) {
  if (options.dataSource === 'inline') {
    return userPreferencesFromInlineDataSource(options);
  } else {
    return fetchMedicationsFromUserPreferencesOrMedicationStatement(options);
  }
}

function makeDrugInteractionPair(interactionsData) {
  const results = [];
  // Get drug interaction info
  const fullInteractionTypeGroup = get(interactionsData, 'fullInteractionTypeGroup', []);

  // TODO: find a better way for nested forEach without lodash
  fullInteractionTypeGroup.forEach(group => {
    group.fullInteractionType.forEach(interactionType => {
      interactionType.interactionPair.forEach(interactionPair => {
        const firstDrug = get(interactionPair, 'interactionConcept.0.minConceptItem.name', '');
        const secondDrug = get(interactionPair, 'interactionConcept.1.minConceptItem.name', '');

        results.push({
          interactionDrugs: `${firstDrug}, ${secondDrug}`,
          severity: interactionPair.severity,
          description: interactionPair.description,
        });
      });
    });
  });
  const count = results.length;
  const list = results;

  return {
    list,
    count,
  };
}
