/**
 * Extrator de Exames Laboratoriais - HCMED Parser
 * 
 * Este script parseia o texto bruto copiado do sistema HCMED e
 * gera um resumo organizado dos resultados laboratoriais.
 */

// ===== MAPEAMENTO DE EXAMES =====
const EXAM_MAPPINGS = {
    // Gerais - Hemograma
    'HEMOGLOBINA': { abbrev: 'Hb', category: 'gerais', unit: 'g/dL' },
    'HEMATÓCRITO': { abbrev: 'Ht', category: 'gerais', unit: '%' },
    'HEMATOCRITO': { abbrev: 'Ht', category: 'gerais', unit: '%' },
    'VCM': { abbrev: 'VCM', category: 'gerais', unit: 'fL' },
    'LEUCÓCITOS': { abbrev: 'Leuco', category: 'gerais', unit: 'mil/mm³' },
    'NEUTRÓFILOS': { abbrev: 'N', category: 'leucograma', unit: '%' },
    'LINFÓCITOS': { abbrev: 'Ly', category: 'leucograma', unit: '%' },
    'MONÓCITOS': { abbrev: 'Mo', category: 'leucograma', unit: '%' },
    'EOSINÓFILOS': { abbrev: 'Eo', category: 'leucograma', unit: '%' },
    'PLAQUETAS': { abbrev: 'Plaq', category: 'gerais', unit: 'mil/mm³' },

    // Gerais - Bioquímica
    'CREATININA': { abbrev: 'Cr', category: 'gerais', unit: 'mg/dL' },
    'URÉIA': { abbrev: 'Ur', category: 'gerais', unit: 'mg/dL' },
    'UREIA': { abbrev: 'Ur', category: 'gerais', unit: 'mg/dL' },
    'URÉIA SÉRICA': { abbrev: 'Ur', category: 'gerais', unit: 'mg/dL' },
    'UREIA SERICA': { abbrev: 'Ur', category: 'gerais', unit: 'mg/dL' },
    'SÓDIO': { abbrev: 'Na', category: 'gerais', unit: 'mEq/L' },
    'SODIO': { abbrev: 'Na', category: 'gerais', unit: 'mEq/L' },
    'SÓDIO SÉRICO': { abbrev: 'Na', category: 'gerais', unit: 'mEq/L' },
    'SODIO SERICO': { abbrev: 'Na', category: 'gerais', unit: 'mEq/L' },
    'POTÁSSIO': { abbrev: 'K', category: 'gerais', unit: 'mEq/L' },
    'POTASSIO': { abbrev: 'K', category: 'gerais', unit: 'mEq/L' },
    'POTÁSSIO SÉRICO': { abbrev: 'K', category: 'gerais', unit: 'mEq/L' },
    'POTASSIO SERICO': { abbrev: 'K', category: 'gerais', unit: 'mEq/L' },
    'CLORO': { abbrev: 'Cl', category: 'gerais', unit: 'mEq/L' },
    'CÁLCIO TOTAL': { abbrev: 'Ca', category: 'gerais', unit: 'mg/dL' },
    'CÁLCIO IÔNICO': { abbrev: 'CaI', category: 'gerais', unit: 'mg/dL' },
    'FÓSFORO': { abbrev: 'P', category: 'gerais', unit: 'mg/dL' },
    'FOSFORO': { abbrev: 'P', category: 'gerais', unit: 'mg/dL' },
    'MAGNÉSIO': { abbrev: 'Mg', category: 'gerais', unit: 'mg/dL' },
    'MAGNESIO': { abbrev: 'Mg', category: 'gerais', unit: 'mg/dL' },

    // Gerais - Hepático
    'TGO': { abbrev: 'AST', category: 'gerais', unit: 'U/L' },
    'AST': { abbrev: 'AST', category: 'gerais', unit: 'U/L' },
    'ASPARTATO AMINOTRANSFERASE': { abbrev: 'AST', category: 'gerais', unit: 'U/L' },
    'ASPARTATO AMINO TRANSFERASE': { abbrev: 'AST', category: 'gerais', unit: 'U/L' },
    'TGP': { abbrev: 'ALT', category: 'gerais', unit: 'U/L' },
    'ALT': { abbrev: 'ALT', category: 'gerais', unit: 'U/L' },
    'ALANINA AMINOTRANSFERASE': { abbrev: 'ALT', category: 'gerais', unit: 'U/L' },
    'BILIRRUBINA TOTAL': { abbrev: 'BT', category: 'gerais', unit: 'mg/dL' },
    'BILIRRUBINA DIRETA': { abbrev: 'BD', category: 'gerais', unit: 'mg/dL' },
    'PROTEÍNAS TOTAIS': { abbrev: 'PT', category: 'gerais', unit: 'g/dL' },
    'PROTEINAS TOTAIS': { abbrev: 'PT', category: 'gerais', unit: 'g/dL' },
    'ALBUMINA': { abbrev: 'ALB', category: 'gerais', unit: 'g/dL' },
    'FOSFATASE ALCALINA': { abbrev: 'FA', category: 'gerais', unit: 'U/L' },
    'GAMA GT': { abbrev: 'GGT', category: 'gerais', unit: 'U/L' },
    'GAMA-GT': { abbrev: 'GGT', category: 'gerais', unit: 'U/L' },
    'GGT': { abbrev: 'GGT', category: 'gerais', unit: 'U/L' },
    'AMILASE': { abbrev: 'AMIL', category: 'gerais', unit: 'U/L' },
    'LIPASE': { abbrev: 'LIP', category: 'gerais', unit: 'U/L' },

    // Coagulação - DD e Fibrinogênio agora em trombofilias
    // INR is handled specially in parseGenericExam - not in generic mapping
    'D-DÍMERO': { abbrev: 'DD', category: 'trombofilias', unit: 'ng/mL' },
    'D-DIMERO': { abbrev: 'DD', category: 'trombofilias', unit: 'ng/mL' },
    'DIMERO-D': { abbrev: 'DD', category: 'trombofilias', unit: 'ng/mL' },
    'DOSAGEM DO DÍMERO-D QUANTITATIVO': { abbrev: 'DD', category: 'trombofilias', unit: 'ng/mL' },
    'FIBRINOGÊNIO': { abbrev: 'Fibrinogênio', category: 'trombofilias', unit: 'mg/dL' },
    'FIBRINOGENIO': { abbrev: 'Fibrinogênio', category: 'trombofilias', unit: 'mg/dL' },

    // Sorologias
    'ANTI-HBC': { abbrev: 'HepB.Anti-HBc', category: 'sorologias' },
    'ANTI-HBC TOTAL': { abbrev: 'HepB.Anti-HBc', category: 'sorologias' },
    'HEPATITE B - ANTI-HBC TOTAL': { abbrev: 'HepB.Anti-HBc', category: 'sorologias' },
    'ANTI-HBS': { abbrev: 'HepB.Anti-HBs', category: 'sorologias' },
    'HEPATITE B - ANTI-HBS': { abbrev: 'HepB.Anti-HBs', category: 'sorologias' },
    'AGHBS': { abbrev: 'HepB.Ag-HBs', category: 'sorologias' },
    'AG-HBS': { abbrev: 'HepB.Ag-HBs', category: 'sorologias' },
    'AGHBE': { abbrev: 'HepB.Ag-HBe', category: 'sorologias' },
    'HEPATITE B - AGHBS': { abbrev: 'HepB.Ag-HBs', category: 'sorologias' },
    'HEPATITE B - AGHBE': { abbrev: 'HepB.Ag-HBe', category: 'sorologias' },
    'ANTI-HCV': { abbrev: 'HepC', category: 'sorologias' },
    'HEPATITE C': { abbrev: 'HepC', category: 'sorologias' },
    'HEPATITE C - SOROLOGIA': { abbrev: 'HepC', category: 'sorologias' },
    'ANTI-HIV': { abbrev: 'Anti-HIV', category: 'sorologias' },
    'HIV': { abbrev: 'Anti-HIV', category: 'sorologias' },
    'VDRL': { abbrev: 'VDRL', category: 'sorologias' },
    'TREPONEMA PALLIDUM': { abbrev: 'VDRL', category: 'sorologias' },
    'SOROLOGIA PARA TREPONEMA PALLIDUM': { abbrev: 'VDRL', category: 'sorologias' },
    'CMV IGG': { abbrev: 'CMV.IgG', category: 'sorologias' },
    'CMV IGM': { abbrev: 'CMV.IgM', category: 'sorologias' },
    'CITOMEGALOVIRUS IGG': { abbrev: 'CMV.IgG', category: 'sorologias' },
    'CITOMEGALOVIRUS IGM': { abbrev: 'CMV.IgM', category: 'sorologias' },
    'VARICELA IGG': { abbrev: 'VZV.IgG', category: 'sorologias' },
    'VARICELA IGM': { abbrev: 'VZV.IgM', category: 'sorologias' },
    'VZV IGG': { abbrev: 'VZV.IgG', category: 'sorologias' },
    'VZV IGM': { abbrev: 'VZV.IgM', category: 'sorologias' },
    'HERPES SIMPLES IGG': { abbrev: 'HSV.IgG', category: 'sorologias' },
    'HERPES SIMPLES IGM': { abbrev: 'HSV.IgM', category: 'sorologias' },
    'HSV IGG': { abbrev: 'HSV.IgG', category: 'sorologias' },
    'HSV IGM': { abbrev: 'HSV.IgM', category: 'sorologias' },
    'HTLV IGG': { abbrev: 'HTLV.IgG', category: 'sorologias' },
    'HTLV IGM': { abbrev: 'HTLV.IgM', category: 'sorologias' },
    'TOXOPLASMOSE IGG': { abbrev: 'TOXO.IgG', category: 'sorologias' },
    'TOXOPLASMOSE IGM': { abbrev: 'TOXO.IgM', category: 'sorologias' },
    'TOXOPLASMA IGG': { abbrev: 'TOXO.IgG', category: 'sorologias' },
    'TOXOPLASMA IGM': { abbrev: 'TOXO.IgM', category: 'sorologias' },

    // Metabólico
    'GLICOSE': { abbrev: 'Glic', category: 'metabolico', unit: 'mg/dL' },
    'GLICEMIA': { abbrev: 'Glic', category: 'metabolico', unit: 'mg/dL' },
    'HEMOGLOBINA GLICADA': { abbrev: 'HbGlic', category: 'metabolico', unit: '%' },
    'HBA1C': { abbrev: 'HbGlic', category: 'metabolico', unit: '%' },
    // Colesterol Não-HDL (deve ser ignorado - vem ANTES de HDL para evitar match parcial)
    'NÃO - HDL - COLESTEROL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'NÃO-HDL-COLESTEROL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'NÃO - HDL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'NÃO-HDL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'NAO - HDL - COLESTEROL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'NAO-HDL-COLESTEROL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'NAO - HDL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'NAO-HDL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'COLESTEROL NÃO HDL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'COLESTEROL NAO HDL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'COLESTEROL NÃO-HDL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    'COLESTEROL NAO-HDL': { abbrev: null, category: 'ignore', unit: 'mg/dL' },
    // HDL (após não-HDL para evitar match parcial)
    'HDL': { abbrev: 'HDL', category: 'metabolico', unit: 'mg/dL' },
    'HDL-COLESTEROL': { abbrev: 'HDL', category: 'metabolico', unit: 'mg/dL' },
    'HDL - COLESTEROL': { abbrev: 'HDL', category: 'metabolico', unit: 'mg/dL' },
    'LDL': { abbrev: 'LDL', category: 'metabolico', unit: 'mg/dL' },
    'LDL-COLESTEROL': { abbrev: 'LDL', category: 'metabolico', unit: 'mg/dL' },
    'LDL - COLESTEROL': { abbrev: 'LDL', category: 'metabolico', unit: 'mg/dL' },
    'VLDL': { abbrev: 'VLDL', category: 'metabolico', unit: 'mg/dL' },
    'VLDL - COLESTEROL': { abbrev: 'VLDL', category: 'metabolico', unit: 'mg/dL' },
    'COLESTEROL TOTAL': { abbrev: 'ColT', category: 'metabolico', unit: 'mg/dL' },
    'TRIGLICÉRIDES': { abbrev: 'Trig', category: 'metabolico', unit: 'mg/dL' },
    'TRIGLICERIDES': { abbrev: 'Trig', category: 'metabolico', unit: 'mg/dL' },
    'NT-PROBNP': { abbrev: 'NT-proBNP', category: 'cardio', unit: 'pg/mL' },
    'BNP': { abbrev: 'NT-proBNP', category: 'cardio', unit: 'pg/mL' },
    'TSH': { abbrev: 'TSH', category: 'metabolico', unit: 'µUI/mL' },
    'HORMÔNIO TIREO-ESTIMULANTE': { abbrev: 'TSH', category: 'metabolico', unit: 'µUI/mL' },
    'HORMÔNIO TIREO-ESTIMULANTE (TSH)': { abbrev: 'TSH', category: 'metabolico', unit: 'µUI/mL' },
    'HORMONIO TIREO-ESTIMULANTE': { abbrev: 'TSH', category: 'metabolico', unit: 'µUI/mL' },
    'HORMONIO TIREO-ESTIMULANTE (TSH)': { abbrev: 'TSH', category: 'metabolico', unit: 'µUI/mL' },
    'T4 LIVRE': { abbrev: 'T4L', category: 'metabolico', unit: 'ng/dL' },
    'T4L': { abbrev: 'T4L', category: 'metabolico', unit: 'ng/dL' },
    'VITAMINA B12': { abbrev: 'B12', category: 'metabolico', unit: 'pg/mL' },
    'VITAMINA B 12': { abbrev: 'B12', category: 'metabolico', unit: 'pg/mL' },
    'B12': { abbrev: 'B12', category: 'metabolico', unit: 'pg/mL' },
    'ÁCIDO FÓLICO': { abbrev: 'AF', category: 'metabolico', unit: 'ng/mL' },
    'ACIDO FOLICO': { abbrev: 'AF', category: 'metabolico', unit: 'ng/mL' },
    'VITAMINA D': { abbrev: 'VitD', category: 'metabolico', unit: 'ng/mL' },
    '25-HIDROXIVITAMINA D': { abbrev: 'VitD', category: 'metabolico', unit: 'ng/mL' },
    'PTH': { abbrev: 'PTH', category: 'metabolico', unit: 'pg/mL' },
    'PARATORMÔNIO': { abbrev: 'PTH', category: 'metabolico', unit: 'pg/mL' },
    'CPK': { abbrev: 'CPK', category: 'metabolico', unit: 'U/L' },
    'CREATINOQUINASE': { abbrev: 'CPK', category: 'metabolico', unit: 'U/L' },
    'TROPONINA': { abbrev: 'Tropo-T', category: 'cardio', unit: 'ng/L' },
    'TROPONINA T': { abbrev: 'Tropo-T', category: 'cardio', unit: 'ng/L' },
    'TROPONINA I': { abbrev: 'Tropo-T', category: 'cardio', unit: 'ng/L' },
    'TROPONINA I ULTRASENSÍVEL': { abbrev: 'Tropo-T', category: 'cardio', unit: 'ng/L' },
    'FERRO': { abbrev: 'Fe', category: 'metabolico', unit: 'µg/dL' },
    'FERRO SÉRICO': { abbrev: 'Fe', category: 'metabolico', unit: 'µg/dL' },
    'FERRITINA': { abbrev: 'Ferritina', category: 'metabolico', unit: 'ng/mL' },
    'CAPACIDADE TOTAL DE LIGAÇÃO DO FERRO': { abbrev: 'CTLF', category: 'metabolico', unit: 'µg/dL' },
    'CAPACIDADE TOTAL DE LIGAÇÃO DE FERRO': { abbrev: 'CTLF', category: 'metabolico', unit: 'µg/dL' },
    'CTLF': { abbrev: 'CTLF', category: 'metabolico', unit: 'µg/dL' },
    'SATURAÇÃO DE TRANSFERRINA': { abbrev: 'STf', category: 'metabolico', unit: '%' },
    'SATURAÇÃO DA TRANSFERRINA': { abbrev: 'STf', category: 'metabolico', unit: '%' },
    'PCR': { abbrev: 'PCR', category: 'reumato', unit: 'mg/L' },
    'PROTEÍNA C REATIVA': { abbrev: 'PCR', category: 'reumato', unit: 'mg/L' },
    'PROTEÍNA C REATIVA (PCR)': { abbrev: 'PCR', category: 'reumato', unit: 'mg/L' },
    'VHS': { abbrev: 'VHS', category: 'reumato', unit: 'mm' },
    'VELOCIDADE DE HEMOSSEDIMENTAÇÃO': { abbrev: 'VHS', category: 'reumato', unit: 'mm' },
    'DHL': { abbrev: 'DHL', category: 'metabolico', unit: 'U/L' },
    'DESIDROGENASE LÁCTICA': { abbrev: 'DHL', category: 'metabolico', unit: 'U/L' },
    'LDH': { abbrev: 'DHL', category: 'metabolico', unit: 'U/L' },

    // Reumatológico / Autoimune
    'FATOR REUMATÓIDE': { abbrev: 'FR', category: 'reumato' },
    'FATOR REUMATOIDE': { abbrev: 'FR', category: 'reumato' },
    'FR': { abbrev: 'FR', category: 'reumato' },
    'FAN': { abbrev: 'FAN', category: 'reumato' },
    'FATOR ANTINUCLEAR': { abbrev: 'FAN', category: 'reumato' },
    'ANTI-RO': { abbrev: 'Anti-Ro', category: 'reumato' },
    'ANTI-SSA': { abbrev: 'Anti-Ro', category: 'reumato' },
    'ANTI-LA': { abbrev: 'Anti-La', category: 'reumato' },
    'ANTI-SSB': { abbrev: 'Anti-La', category: 'reumato' },
    'ANTI-MPO': { abbrev: 'Anti-MPO', category: 'reumato' },
    'P-ANCA': { abbrev: 'Anti-MPO', category: 'reumato' },
    'ANTI-PR3': { abbrev: 'Anti-PR3', category: 'reumato' },
    'C-ANCA': { abbrev: 'Anti-PR3', category: 'reumato' },
    'ANTI-DSDNA': { abbrev: 'anti-dsDNA', category: 'reumato' },
    'ANTI-DNA': { abbrev: 'anti-dsDNA', category: 'reumato' },
    'ANTI-SM': { abbrev: 'anti-Sm', category: 'reumato' },
    'C3': { abbrev: 'C3', category: 'reumato' },
    'COMPLEMENTO C3': { abbrev: 'C3', category: 'reumato' },
    'FRAÇÃO C3 DO COMPLEMENTO': { abbrev: 'C3', category: 'reumato' },
    'C4': { abbrev: 'C4', category: 'reumato' },
    'COMPLEMENTO C4': { abbrev: 'C4', category: 'reumato' },
    'FRAÇÃO C4 DO COMPLEMENTO': { abbrev: 'C4', category: 'reumato' },
    'IMUNOFIXAÇÃO': { abbrev: 'IFS', category: 'reumato' },
    'ELETROFORESE DE PROTEÍNAS': { abbrev: 'EFPS', category: 'reumato' },
    'IGK': { abbrev: 'Igk', category: 'reumato' },
    'IMUNOGLOBULINA KAPPA': { abbrev: 'Igk', category: 'reumato' },
    'IGL': { abbrev: 'Igl', category: 'reumato' },
    'IMUNOGLOBULINA LAMBDA': { abbrev: 'Igl', category: 'reumato' },
    'RELAÇÃO KAPPA/LAMBDA': { abbrev: 'RKL', category: 'reumato' },

    // Trombofilias
    'ANTICOAGULANTE LÚPICO': { abbrev: 'Anticoagulante lúpico', category: 'trombofilias' },
    'ANTICOAGULANTE LUPICO': { abbrev: 'Anticoagulante lúpico', category: 'trombofilias' },
    'ANTICARDIOLIPINA IGG': { abbrev: 'Anticardiolipina IgG', category: 'trombofilias' },
    'ANTICARDIOLIPINA IGM': { abbrev: 'Anticardiolipina IgM', category: 'trombofilias' },
    'ANTI-BETA-2-GLICOPROTEÍNA': { abbrev: 'Anti-beta-2-glicoproteína', category: 'trombofilias' },
    'PROTEÍNA C FUNCIONAL': { abbrev: 'Proteína C', category: 'trombofilias' },
    'PROTEINA C FUNCIONAL': { abbrev: 'Proteína C', category: 'trombofilias' },
    'PROTEÍNA S LIVRE': { abbrev: 'Proteína S', category: 'trombofilias' },
    'PROTEINA S LIVRE': { abbrev: 'Proteína S', category: 'trombofilias' },
    'ANTITROMBINA III': { abbrev: 'Antitrombina III', category: 'trombofilias' },
    'ANTITROMBINA': { abbrev: 'Antitrombina III', category: 'trombofilias' },
    'FATOR V DE LEIDEN': { abbrev: 'Mutação fator V de Leiden', category: 'trombofilias' },
    'MUTAÇÃO DO FATOR V': { abbrev: 'Mutação fator V de Leiden', category: 'trombofilias' },
    'MUTAÇÃO DA PROTROMBINA': { abbrev: 'Mutação de protrombina', category: 'trombofilias' },
    'PROTROMBINA 20210': { abbrev: 'Mutação de protrombina', category: 'trombofilias' },
    'HOMOCISTEÍNA': { abbrev: 'Dosagem de homocisteína', category: 'trombofilias' },
    'HOMOCISTEINA': { abbrev: 'Dosagem de homocisteína', category: 'trombofilias' },
    'ELETROFORESE DE HEMOGLOBINA': { abbrev: 'EFH', category: 'trombofilias' },

    // Níveis séricos de anticonvulsivantes
    'ÁCIDO VALPRÓICO': { abbrev: 'VPA', category: 'niveis', unit: 'µg/mL' },
    'ACIDO VALPROICO': { abbrev: 'VPA', category: 'niveis', unit: 'µg/mL' },
    'VALPROATO': { abbrev: 'VPA', category: 'niveis', unit: 'µg/mL' },
    'FENITOÍNA': { abbrev: 'PHT', category: 'niveis', unit: 'µg/mL' },
    'FENITOINA': { abbrev: 'PHT', category: 'niveis', unit: 'µg/mL' },
    'LEVETIRACETAM': { abbrev: 'LEV', category: 'niveis', unit: 'µg/mL' },
    'CARBAMAZEPINA': { abbrev: 'CBZ', category: 'niveis', unit: 'µg/mL' },
    'FENOBARBITAL': { abbrev: 'PB', category: 'niveis', unit: 'µg/mL' },
    'LAMOTRIGINA': { abbrev: 'LTG', category: 'niveis', unit: 'µg/mL' },

    // LCR
    'PROTEÍNA TOTAL LCR': { abbrev: 'PT', category: 'lcr' },
    'PROTEÍNAS TOTAIS LCR': { abbrev: 'PT', category: 'lcr' },
    'GLICOSE LCR': { abbrev: 'Glico', category: 'lcr' },
    'GLICORRAQUIA': { abbrev: 'Glico', category: 'lcr' },
    'LACTATO LCR': { abbrev: 'Lac', category: 'lcr' },
    'ADA LCR': { abbrev: 'ADA', category: 'lcr' },
    'ADENOSINA DEAMINASE': { abbrev: 'ADA', category: 'lcr' },
    'VDRL LCR': { abbrev: 'VDRL', category: 'lcr' },
    'CRIPTOCOCO': { abbrev: 'Crypto', category: 'lcr' },
    'CRYPTOCOCCUS': { abbrev: 'Crypto', category: 'lcr' },
    'PESQUISA DE BAAR': { abbrev: 'pBAAR', category: 'lcr' },
    'RT-PCR TUBERCULOSE': { abbrev: 'RT-TB', category: 'lcr' },
    'GENEXPERT': { abbrev: 'RT-TB', category: 'lcr' },
    'PAINEL VIRAL': { abbrev: 'Painel Viral', category: 'lcr' },
    'BANDAS OLIGOCLONAIS': { abbrev: 'BOC', category: 'lcr' },
    'ELETROFORESE LCR': { abbrev: 'EFP', category: 'lcr' },
};

// ===== VALORES DE REFERÊNCIA =====
const REFERENCE_VALUES = {
    // Hemograma
    'Hb': { min: 12.5, max: 15.5 },
    'Ht': { min: 36, max: 48 },
    'VCM': { min: 80, max: 95 },
    'Leuco': { min: 4.0, max: 11.0 },
    'Plaq': { min: 162, max: 425 },

    // Renal/Eletrólitos
    'Cr': { max: 1.2 },
    'Ur': { max: 50 },
    'Na': { min: 136, max: 145 },
    'K': { min: 3.5, max: 5.1 },
    'Mg': { min: 1.6, max: 2.6 },
    'P': { min: 2.3, max: 4.7 },
    'Cl': { min: 98, max: 107 },
    'Ca': { min: 8.4, max: 10.2 },
    'CaI': { min: 4.49, max: 5.29 },

    // Hepáticos
    'AST': { max: 34 },
    'ALT': { max: 45 },
    'BT': { max: 1.2 },
    'BD': { max: 0.5 },
    'FA': { max: 129 },
    'GGT': { max: 64 },
    'AMIL': { max: 100 },
    'LIP': { min: 4, max: 60 },
    'ALB': { min: 3.5, max: 5 },
    'PT': { min: 6.4, max: 8.3 },

    // Coagulação
    'INR': { min: 0.95, max: 1.2 },
    'R': { min: 0.89, max: 1.19 },
    'DD': { max: 500 },
    'Fibrinogênio': { min: 200, max: 393 },

    // Gasometria Venosa
    'GV.pH': { min: 7.35, max: 7.45 },
    'GV.pCO2': { min: 35, max: 45 },
    'GV.BIC': { min: 22, max: 29 },
    'GV.LAC': { max: 2.0 },

    // Gasometria Arterial
    'GA.pH': { min: 7.35, max: 7.45 },
    'GA.pO2': { min: 75, max: 105 },
    'GA.pCO2': { min: 35, max: 45 },
    'GA.BIC': { min: 22, max: 28 },
    'GA.LAC': { max: 2.0 },
    'GA.SO2': { min: 95 },

    // Inflamatórios
    'PCR': { max: 5 },
    'VHS': { max: 20 },

    // Metabólico
    'Glic': { min: 70, max: 99 },
    'HbGlic': { max: 6 },
    'Trig': { max: 175 },
    'ColT': { max: 190 },
    'HDL': { min: 40 },
    'LDL': { max: 100 },
    'VLDL': { max: 35 },
    'DHL': { min: 125, max: 220 },

    // Tireoide
    'TSH': { min: 0.35, max: 4.94 },
    'T4L': { min: 0.70, max: 1.48 },

    // Vitaminas/Nutrientes
    'VitD': { min: 30, max: 100 },
    'B12': { min: 187, max: 883 },
    'AF': { min: 3.1, max: 20.5 },
    'Fe': { min: 50, max: 175 },
    'Ferritina': { min: 21, max: 270 },

    // Níveis Séricos de Drogas
    'VPA': { min: 50, max: 100 },
    'PHT': { min: 10, max: 20 },
    'LEV': { min: 12, max: 46 },
    'CBZ': { min: 4, max: 12 },
    'PB': { min: 15, max: 40 },

    // Cardio
    'Tropo-T': { max: 14 },
    'NT-proBNP': { max: 125 },
    'CPK': { min: 30, max: 200 },

    // Outros
    'PTH': { min: 15, max: 68 },
    'Cortisol': { min: 6.7, max: 22.6 },

    // LCR (valores específicos para líquor - diferentes dos séricos)
    'Cel': { max: 4 },
    'Hem': { max: 0 },
    'Glico': { min: 50, max: 70 },  // Glicose LCR
    'Lac': { min: 1.1, max: 2.4 },  // Lactato LCR

    // Complemento
    'C3': { min: 82, max: 193 },
    'C4': { min: 13, max: 44 },

    // Imunoglobulinas
    'IgA': { min: 69, max: 500 },
    'IgG': { min: 540, max: 1822 },
    'IgM': { min: 22, max: 293 },
};

/**
 * Verifica se um valor está fora do intervalo de referência
 * @param {string} examName - Nome/abreviatura do exame
 * @param {string|number} value - Valor do exame
 * @returns {boolean} - true se o valor está alterado, false se normal ou não há referência
 */
function isAbnormal(examName, value) {
    const ref = REFERENCE_VALUES[examName];
    if (!ref) return false;

    // Trata valores qualitativos
    if (typeof value === 'string') {
        // Valores qualitativos negativos são normais
        const normalQualitative = ['nr', 'não reagente', 'negativo', 'neg', 'não detectado', 'ausência'];
        if (normalQualitative.some(v => value.toLowerCase().includes(v))) {
            return false;
        }
        // Tenta extrair número
        const numMatch = value.match(/[\d,\.]+/);
        if (!numMatch) return false;
        value = parseFloat(numMatch[0].replace(',', '.'));
    } else if (typeof value === 'number') {
        // OK
    } else {
        return false;
    }

    if (isNaN(value)) return false;

    // Verifica se está fora dos limites
    if (ref.min !== undefined && value < ref.min) return true;
    if (ref.max !== undefined && value > ref.max) return true;

    return false;
}

// ===== CLASSE PRINCIPAL DO PARSER =====
class ExamParser {
    constructor() {
        this.results = {};
        this.allResults = []; // Stores ALL results for table generation
        this.gasometriaVenosa = {};
        this.gasometriaArterial = {};
        this.allGasometrias = []; // Stores ALL gasometrias for table
        this.leucograma = {};
        this.lcrData = {};
        this.examCount = 0;
        this.mostRecentDate = null;
    }

    /**
     * Parseia o texto bruto e extrai os exames
     */
    parse(rawText) {
        this.results = {};
        this.allResults = [];
        this.gasometriaVenosa = {};
        this.gasometriaArterial = {};
        this.allGasometrias = [];
        this.leucograma = {};
        this.lcrData = {};
        this.examCount = 0;
        this.mostRecentDate = null;

        // Remove linhas de "Resultado dos 3 últimos exames" e seus valores
        const cleanedText = this.removeHistoricalResults(rawText);

        // Divide o texto em blocos de exames
        const examBlocks = this.splitIntoExamBlocks(cleanedText);

        // Processa cada bloco
        examBlocks.forEach(block => {
            this.processExamBlock(block);
        });

        return this.formatOutput();
    }

    /**
     * Remove resultados históricos do texto
     */
    removeHistoricalResults(text) {
        // Remove seções de "Resultado dos 3 últimos exames"
        let cleaned = text.replace(/Resultado dos \d+ últimos exames:[\s\S]*?(?=\d{2}\/\d{2}\/\d{4}|\n\n|$)/gi, '');

        // Remove linhas que são apenas datas com valores antigos
        cleaned = cleaned.replace(/^\d{2}\/\d{2}\/\d{4}\s*-\s*[\d,\.]+\s*\w*\/?\w*\s*$/gm, '');

        return cleaned;
    }

    /**
     * Divide o texto em blocos de exames baseado nos timestamps
     */
    splitIntoExamBlocks(text) {
        // Padrão para encontrar início de cada exame
        const blockPattern = /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}[\s\S]*?)(?=\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}|$)/g;
        const blocks = [];
        let match;

        while ((match = blockPattern.exec(text)) !== null) {
            blocks.push(match[1]);
        }

        return blocks;
    }

    /**
     * Processa um bloco individual de exame
     */
    processExamBlock(block) {
        // Verifica se o exame foi realizado
        if (block.includes('MATERIAL COAGULADO') || block.includes('EXAME NAO REALIZADO') || block.includes('EXAME NÃO REALIZADO')) {
            return;
        }

        // Extrai a data de coleta
        const dateMatch = block.match(/Coletado em:\s*(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})/);
        if (!dateMatch) return;

        const collectionDate = this.parseDate(dateMatch[1], dateMatch[2]);

        // Atualiza a data mais recente
        if (!this.mostRecentDate || collectionDate > this.mostRecentDate) {
            this.mostRecentDate = collectionDate;
        }

        // Identifica o tipo de exame
        if (block.includes('GASOMETRIA - SANGUE VENOSO') || block.includes('GASOMETRIA VENOSA')) {
            this.parseGasometria(block, 'venosa', collectionDate);
        } else if (block.includes('GASOMETRIA - SANGUE ARTERIAL') || block.includes('GASOMETRIA ARTERIAL')) {
            this.parseGasometria(block, 'arterial', collectionDate);
        } else if (block.includes('HEMOGRAMA COMPLETO')) {
            this.parseHemograma(block, collectionDate);
        } else if (block.includes('LCR') || block.includes('LÍQUOR') || block.includes('LIQUOR')) {
            this.parseLCR(block, collectionDate);
        } else if (block.includes('URINA TIPO 1') || block.includes('URINA 1')) {
            this.parseUrina1(block, collectionDate);
        } else {
            this.parseGenericExam(block, collectionDate);
        }
    }

    /**
     * Converte string de data para objeto Date
     */
    parseDate(dateStr, timeStr) {
        const [day, month, year] = dateStr.split('/');
        const [hour, minute] = timeStr.split(':');
        return new Date(year, month - 1, day, hour, minute);
    }

    /**
     * Parseia gasometria venosa ou arterial
     */
    parseGasometria(block, type, date) {
        const prefix = type === 'venosa' ? 'GV' : 'GA';
        const storage = type === 'venosa' ? this.gasometriaVenosa : this.gasometriaArterial;

        // Padrões para extrair valores da gasometria
        const patterns = {
            pH: /\bpH\s+([\d,\.]+)/i,
            pO2: /\bpO2\s+([\d,\.]+)/i,
            pCO2: /\bpCO2\s+([\d,\.]+)/i,
            BIC: /\bctHCO3\s+([\d,\.]+)/i,
            LAC: /\bLACTATO\s+([\d,\.]+)/i,
            SO2: /\bSO2\s+([\d,\.]+)/i,
        };

        const gasData = { type: prefix, date };
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = block.match(pattern);
            if (match) {
                const value = this.normalizeNumber(match[1]);
                gasData[key] = value;

                // Atualiza o mais recente para exibição
                if (!storage._date || storage._date < date) {
                    storage[key] = value;
                }
                this.examCount++;
            }
        }

        // Salva a data mais recente
        if (!storage._date || storage._date < date) {
            storage._date = date;
        }

        // Salva para a tabela (todas as gasometrias)
        if (Object.keys(gasData).length > 2) { // tem dados além de type e date
            this.allGasometrias.push(gasData);
        }

        // Extrai sódio, potássio e cloro da gasometria também
        const sodioMatch = block.match(/\bSODIO\s+([\d,\.]+)/i);
        const potassioMatch = block.match(/\bPOTASSIO\s+([\d,\.]+)/i);
        const cloroMatch = block.match(/\bCLORO\s+([\d,\.]+)/i);

        // Só usa esses valores se não tivermos valores mais recentes do soro
        if (sodioMatch && !this.results['Na']) {
            // Gasometria tem valores, mas preferimos do soro
        }
    }

    /**
     * Parseia hemograma completo
     */
    parseHemograma(block, date) {
        // Hemoglobina
        this.extractAndStore(block, /Hemoglobina\s+([\d,\.]+)\s*g\/dL/i, 'Hb', 'gerais', date);

        // Hematócrito
        this.extractAndStore(block, /Hematócrito\s+([\d,\.]+)\s*%/i, 'Ht', 'gerais', date);

        // VCM
        this.extractAndStore(block, /VCM\s+([\d,\.]+)\s*fL/i, 'VCM', 'gerais', date);

        // Leucócitos
        const leucoMatch = block.match(/Leucócitos\s+([\d,\.]+)\s*mil\/mm³/i);
        if (leucoMatch) {
            this.storeResult('Leuco', 'gerais', this.normalizeNumber(leucoMatch[1]), date);
        }

        // Neutrófilos, Linfócitos, Monócitos, Eosinófilos (pegar apenas a porcentagem)
        const neutroMatch = block.match(/Neutrófilos\s+([\d,\.]+)%/i);
        const linfoMatch = block.match(/Linfócitos\s+([\d,\.]+)%/i);
        const monoMatch = block.match(/Monócitos\s+([\d,\.]+)%/i);
        const eoMatch = block.match(/Eosinófilos\s+([\d,\.]+)%/i);

        if (neutroMatch) this.leucograma.N = this.normalizeNumber(neutroMatch[1]);
        if (linfoMatch) this.leucograma.Ly = this.normalizeNumber(linfoMatch[1]);
        if (monoMatch) this.leucograma.Mo = this.normalizeNumber(monoMatch[1]);
        if (eoMatch) this.leucograma.Eo = this.normalizeNumber(eoMatch[1]);

        // Plaquetas
        const plaqMatch = block.match(/PLAQUETAS\s+([\d,\.]+)\s*mil\/mm³/i);
        if (plaqMatch) {
            this.storeResult('Plaq', 'gerais', this.normalizeNumber(plaqMatch[1]), date);
        }
    }

    /**
     * Parseia exames de LCR
     */
    parseLCR(block, date) {
        const blockUpper = block.toUpperCase();

        // Proteínas Totais
        if (blockUpper.includes('PROTEÍNAS TOTAIS') || blockUpper.includes('PROTEINAS TOTAIS')) {
            const match = block.match(/PROTEÍNAS?\s+TOTAIS?\s+(\d+)\s*mg\/dL/i);
            if (match) {
                this.storeResult('PT', 'lcr', match[1], date);
            }
        }

        // Glicose
        if (block.match(/GLICOSE\s+-\s+LÍQUOR/i) || block.match(/GLICOSE\s+-\s+LIQUOR/i)) {
            const match = block.match(/GLICOSE\s+([\d,\.]+)\s*mg\/dL/i);
            if (match) {
                this.storeResult('Glico', 'lcr', this.normalizeNumber(match[1]), date);
            }
        }

        // Lactato
        if (block.match(/LACTATO\s+-\s+LÍQUOR/i) || block.match(/LACTATO\s+-\s+LIQUOR/i)) {
            const match = block.match(/LACTATO\s+([\d,\.]+)\s*mmol\/L/i);
            if (match) {
                this.storeResult('Lac', 'lcr', this.normalizeNumber(match[1]), date);
            }
        }

        // ADA (Adenosina Deaminase)
        if (blockUpper.includes('ADENOSINA DEAMINASE')) {
            const match = block.match(/ADENOSINA DEAMINASE\s+(<?\s*[\d,\.]+)\s*U\/L/i);
            if (match) {
                this.storeResult('ADA', 'lcr', match[1].replace(/\s/g, ''), date);
            }
        }

        // Contagem Global (Celularidade)
        if (blockUpper.includes('CONTAGEM GLOBAL')) {
            const cellMatch = block.match(/Celulas?\s*:\s+(\d+)\s*\/mm³/i);
            const hemaciasMatch = block.match(/Hemacias?\s*:\s+(\d+)\s*\/mm³/i);
            if (cellMatch) {
                this.storeResult('Cel', 'lcr', cellMatch[1], date);
            }
            if (hemaciasMatch) {
                this.storeResult('Hem', 'lcr', hemaciasMatch[1], date);
            }
        }

        // Contagem Específica (Diferencial)
        if (blockUpper.includes('CONTAGEM ESPECÍFICA') || blockUpper.includes('CONTAGEM ESPECIFICA')) {
            const linfoMatch = block.match(/Linfocitos?\s*:\s+(\d+)\s*%/i);
            const monoMatch = block.match(/Monócitos?\s*:\s+(\d+)\s*%/i) || block.match(/Monocitos?\s*:\s+(\d+)\s*%/i);
            const neutroMatch = block.match(/Neutrófilos?\s*:\s+(\d+)\s*%/i) || block.match(/Neutrofilos?\s*:\s+(\d+)\s*%/i);

            const diffParts = [];
            if (linfoMatch) diffParts.push(`Ly ${linfoMatch[1]}%`);
            if (monoMatch) diffParts.push(`Mo ${monoMatch[1]}%`);
            if (neutroMatch) diffParts.push(`N ${neutroMatch[1]}%`);

            if (diffParts.length > 0) {
                this.storeResult('Dif', 'lcr', diffParts.join(' '), date);
            }
        }

        // Caracteres Físicos
        if (blockUpper.includes('CARACTERES FÍSICOS') || blockUpper.includes('CARACTERES FISICOS')) {
            const aspectMatch = block.match(/Aspecto e cor\s*:\s+([^\t\n]+)/i);
            if (aspectMatch) {
                const aspecto = aspectMatch[1].trim();
                if (!aspecto.toLowerCase().includes('límpido e incolor')) {
                    this.storeResult('Asp', 'lcr', aspecto, date);
                }
            }
        }

        // Exame Bacterioscópico
        if (blockUpper.includes('EXAME BACTERIOSCÓPICO') || blockUpper.includes('EXAME BACTERIOSCOPICO')) {
            const result = this.extractQualitativeResult(block, ['MICRORGANISMOS']);
            if (result) {
                this.storeResult('Gram', 'lcr', result, date);
            }
        }

        // Cultura Aeróbia
        if (block.match(/CULTURA AERÓBIA\s+-\s+LÍQUOR/i) || block.match(/CULTURA AEROBIA\s+-\s+LIQUOR/i)) {
            const result = this.extractQualitativeResult(block, ['NEGATIVA', 'PARCIAL NEGATIVA']);
            if (result) {
                this.storeResult('Cult', 'lcr', result, date);
            }
        }

        // Cultura para Micobactérias
        if (blockUpper.includes('CULTURA PARA MICOBACTÉRIAS') || blockUpper.includes('CULTURA PARA MICOBACTERIAS')) {
            const result = this.extractQualitativeResult(block, ['NEGATIVA', 'PARCIAL NEGATIVA']);
            if (result) {
                this.storeResult('CultMTB', 'lcr', result, date);
            }
        }

        // Pesquisa de BAAR
        if (blockUpper.includes('PESQUISA DE BACILO ÁLCOOL') || blockUpper.includes('PESQUISA DE BACILO ALCOOL') || blockUpper.includes('BAAR')) {
            const result = this.extractQualitativeResult(block, ['NEGATIVA', 'POSITIVA']);
            if (result) {
                this.storeResult('pBAAR', 'lcr', result, date);
            }
        }

        // Teste Rápido Molecular TB (GeneXpert)
        if (blockUpper.includes('TESTE RÁPIDO MOLECULAR PARA TUBERCULOSE') || blockUpper.includes('GENEXPERT')) {
            if (blockUpper.includes('NÃO DETECTADO') || blockUpper.includes('NAO DETECTADO')) {
                this.storeResult('GeneXpert', 'lcr', 'Neg', date);
            } else if (blockUpper.includes('DETECTADO')) {
                this.storeResult('GeneXpert', 'lcr', 'Pos', date);
            }
        }

        // Citologia Oncótica
        if (blockUpper.includes('CITOLOGIA ONCÓTICA') || blockUpper.includes('CITOLOGIA ONCOTICA')) {
            // Primeiro verifica se está aguardando revisão
            if (blockUpper.includes('AGUARDAR REVISÃO') || blockUpper.includes('AGUARDAR REVISAO')) {
                this.storeResult('CitoOnco', 'lcr', 'Aguarda revisão', date);
            } else if (blockUpper.includes('NEGATIVA') || blockUpper.includes('AUSENCIA DE CÉLULAS NEOPLASICAS') || blockUpper.includes('AUSENCIA DE CELULAS NEOPLASICAS')) {
                this.storeResult('CitoOnco', 'lcr', 'Neg', date);
            } else if (blockUpper.includes('POSITIVA') || blockUpper.includes('CÉLULAS NEOPLÁSICAS')) {
                this.storeResult('CitoOnco', 'lcr', 'Pos', date);
            }
        }

        // Bandas Oligoclonais
        if (blockUpper.includes('BANDAS OLIGOCLONAIS')) {
            if (blockUpper.includes('PRESENTES') || blockUpper.includes('POSITIVO') || blockUpper.includes('DETECTAD')) {
                this.storeResult('BOC', 'lcr', 'Presentes', date);
            } else if (blockUpper.includes('AUSENTES') || blockUpper.includes('NEGATIVO') || blockUpper.includes('NÃO DETECTAD')) {
                this.storeResult('BOC', 'lcr', 'Ausentes', date);
            }
        }

        // PCRs virais - rastreia cada resultado individualmente
        // Para saber se fizeram o painel e todos foram negativos
        const viralTests = [
            { pattern: 'HERPES SIMPLEX I', name: 'HSV1' },
            { pattern: 'HERPES SIMPLEX II', name: 'HSV2' },
            { pattern: 'VARICELA ZOSTER', name: 'VZV' },
            { pattern: ['CITOMEGALOVÍRUS', 'CITOMEGALOVIRUS'], name: 'CMV' },
            { pattern: 'EPSTEIN-BARR', name: 'EBV' },
            { pattern: ['HERPESVÍRUS HUMANO 6', 'HERPESVIRUS HUMANO 6', 'HHV6'], name: 'HHV6' },
            { pattern: ['HERPESVÍRUS HUMANO 7', 'HERPESVIRUS HUMANO 7', 'HHV7'], name: 'HHV7' },
            { pattern: ['ENTEROVÍRUS', 'ENTEROVIRUS'], name: 'EV' },
            { pattern: ['ADENOVÍRUS', 'ADENOVIRUS'], name: 'AdV' },
            { pattern: ['ERITROVÍRUS B19', 'ERITROVIRUS B19', 'PARVOVÍRUS B19', 'PARVOVIRUS B19'], name: 'B19' },
        ];

        for (const test of viralTests) {
            const patterns = Array.isArray(test.pattern) ? test.pattern : [test.pattern];
            const found = patterns.some(p => blockUpper.includes(p));

            if (found) {
                // Ignorar exames suspensos ou cancelados - não conta como testado
                if (blockUpper.includes('EXAME SUSPENSO') || blockUpper.includes('EXAME CANCELADO')) {
                    continue;
                }

                // Marca que fizemos este teste viral
                if (!this.lcrData.viralTested) this.lcrData.viralTested = [];
                if (!this.lcrData.viralTested.includes(test.name)) {
                    this.lcrData.viralTested.push(test.name);
                }

                // Verifica se positivo
                const isPositive = blockUpper.includes('DETECTADO') &&
                    !blockUpper.includes('NÃO DETECTADO') &&
                    !blockUpper.includes('NAO DETECTADO');

                if (isPositive) {
                    if (!this.lcrData.viralPositive) this.lcrData.viralPositive = [];
                    this.lcrData.viralPositive.push(test.name + '+');
                }
            }
        }
    }

    /**
     * Parseia exame de Urina Tipo 1
     */
    parseUrina1(block, date) {
        const blockUpper = block.toUpperCase();

        // Leucócitos /campo
        const leucoMatch = block.match(/Leucocitos?\s*:\s*(\d+)\s*\/campo/i);
        if (leucoMatch) {
            this.storeResult('U1.Leuco', 'urina1', leucoMatch[1], date);
        }

        // Eritrócitos /campo
        const eritroMatch = block.match(/Eritr[oó]citos?\s*:\s*(\d+)\s*\/campo/i);
        if (eritroMatch) {
            this.storeResult('U1.Eritro', 'urina1', eritroMatch[1], date);
        }

        // Proteínas
        const protMatch = block.match(/Proteinas?\s*:\s*([^\t\n]+?)(?:\t|Inferior|$)/i);
        if (protMatch) {
            let protValue = protMatch[1].trim();
            // Se tiver "Inferior a X g/L", pega isso
            const inferiorMatch = block.match(/Proteinas?\s*:\s*Inferior a ([^\t\n]+)/i);
            if (inferiorMatch) {
                protValue = `<${inferiorMatch[1].trim()}`;
            }
            if (protValue) {
                this.storeResult('U1.Prot', 'urina1', protValue, date);
            }
        }

        // Nitrito
        if (blockUpper.includes('NITRITO')) {
            const nitMatch = block.match(/Nitrito\s*:\s*(Negativo|Positivo)/i);
            if (nitMatch) {
                const value = nitMatch[1].toLowerCase() === 'negativo' ? 'neg' : 'pos';
                this.storeResult('U1.Nit', 'urina1', value, date);
            }
        }

        // Leucócito esterase
        if (blockUpper.includes('LEUCÓCITO ESTERASE') || blockUpper.includes('LEUCOCITO ESTERASE')) {
            const leucoEstMatch = block.match(/Leuc[oó]cito esterase\s*:\s*(Negativo|Positivo|[^\t\n]+)/i);
            if (leucoEstMatch) {
                let value = leucoEstMatch[1].trim();
                if (value.toLowerCase() === 'negativo') value = 'neg';
                else if (value.toLowerCase() === 'positivo') value = 'pos';
                this.storeResult('U1.LeucoEst', 'urina1', value, date);
            }
        }

        // Urobilinogênio
        const urobilMatch = block.match(/Urobilinogenio\s*:\s*([\d,\.]+)\s*mg\/dL/i);
        if (urobilMatch) {
            this.storeResult('U1.Urobil', 'urina1', this.normalizeNumber(urobilMatch[1]), date);
        }

        // pH
        const phMatch = block.match(/\bpH\s*:\s*([\d,\.]+)/i);
        if (phMatch) {
            this.storeResult('U1.pH', 'urina1', this.normalizeNumber(phMatch[1]), date);
        }

        // Densidade
        const densMatch = block.match(/Densidade\s*:\s*([\d,\.]+)/i);
        if (densMatch) {
            this.storeResult('U1.Dens', 'urina1', this.normalizeNumber(densMatch[1]), date);
        }

        // Glicose
        const glicoseMatch = block.match(/Glicose\s*:\s*(Negativo|Positivo|[^\t\n]+)/i);
        if (glicoseMatch) {
            let value = glicoseMatch[1].trim();
            if (value.toLowerCase() === 'negativo' || value.toLowerCase() === 'ausente') value = 'neg';
            else if (value.toLowerCase() === 'positivo') value = 'pos';
            this.storeResult('U1.Glic', 'urina1', value, date);
        }

        // Sangue/Hemoglobina
        if (blockUpper.includes('SANGUE')) {
            const sangueMatch = block.match(/Sangue\s*:\s*(Ausente|Presente|[^\t\n]+)/i);
            if (sangueMatch) {
                let value = sangueMatch[1].trim();
                if (value.toLowerCase() === 'ausente') value = 'neg';
                else if (value.toLowerCase().includes('presente')) value = 'pos';
                this.storeResult('U1.Sangue', 'urina1', value, date);
            }
        }

        // Corpos Cetônicos
        if (blockUpper.includes('CORPOS CETONICOS') || blockUpper.includes('CORPOS CETÔNICOS')) {
            const cetoMatch = block.match(/Corpos Ceton?icos\s*:\s*([^\t\n]+)/i);
            if (cetoMatch) {
                let value = cetoMatch[1].trim();
                if (value.toLowerCase() === 'ausente') value = 'neg';
                else if (value.toLowerCase().includes('presença')) value = 'pos';
                this.storeResult('U1.Ceto', 'urina1', value, date);
            }
        }
    }

    /**
     * Extrai resultado qualitativo (Negativa/Positiva, etc)
     */
    extractQualitativeResult(block, keywords) {
        const blockUpper = block.toUpperCase();

        for (const keyword of keywords) {
            if (blockUpper.includes('PARCIAL NEGATIVA')) {
                return 'Parcial Neg';
            }
            if (blockUpper.includes('NEGATIVA') || blockUpper.includes('NÃO FORAM OBSERVADOS')) {
                return 'Neg';
            }
            if (blockUpper.includes('POSITIVA')) {
                return 'Pos';
            }
        }

        return null;
    }

    /**
     * Parseia exames genéricos
     */
    parseGenericExam(block, date) {
        // Extrai o nome do exame
        const examNameMatch = block.match(/([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\-]+)\s*-\s*SANGUE|([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\-]+)\s*-\s*,/i);
        const blockUpper = block.toUpperCase();

        // Ordena mapeamentos por tamanho de nome (mais longos primeiro)
        // Isso evita que "HDL" faça match antes de "NÃO - HDL"
        const sortedMappings = Object.entries(EXAM_MAPPINGS).sort((a, b) => b[0].length - a[0].length);

        // Tenta encontrar o exame no mapeamento
        let foundMatch = false;
        for (const [examName, mapping] of sortedMappings) {
            // Usa word boundary para evitar matches parciais (ex: LDL dentro de VLDL)
            const escapedName = examName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('(^|[^A-Z])' + escapedName + '([^A-Z]|$)', 'i');

            if (regex.test(blockUpper)) {
                // Se a categoria é 'ignore', significa que esse exame foi explicitamente
                // marcado para ser ignorado (ex: colesterol não-HDL)
                // Paramos aqui para evitar que um match mais curto (ex: HDL) seja capturado
                if (mapping.category === 'ignore') {
                    foundMatch = true;
                    break;
                }

                let value = null;

                // Tratamento especial para sorologias (resultados qualitativos)
                if (mapping.category === 'sorologias') {
                    value = this.extractSerologyResult(block);
                } else {
                    // Extrai o valor usando diferentes padrões
                    value = this.extractValue(block, examName);
                }

                if (value !== null && mapping.abbrev) {
                    this.storeResult(mapping.abbrev, mapping.category, value, date);
                    foundMatch = true;
                    break; // Para após encontrar o primeiro match válido
                }
            }
        }

        // Tratamento especial para INR (está dentro do Tempo de Protrombina)
        if (block.includes('TEMPO DE PROTROMBINA')) {
            const inrMatch = block.match(/INR\s*=\s*([\d,\.]+)/i);
            if (inrMatch) {
                this.storeResult('INR', 'gerais', this.normalizeNumber(inrMatch[1]), date);
            }
        }

        // Tratamento especial para R (TTPA)
        if (block.includes('TEMPO DE TROMBOPLASTINA PARCIAL ATIVADA')) {
            const rMatch = block.match(/R\s*=\s*([\d,\.]+)/i);
            if (rMatch) {
                this.storeResult('R', 'gerais', this.normalizeNumber(rMatch[1]), date);
            }
        }

        // Tratamento especial para HIV
        if (block.toUpperCase().includes('HIV') || block.toUpperCase().includes('ANTICORPOS CONTRA HIV')) {
            const result = this.extractSerologyResult(block);
            if (result) {
                this.storeResult('Anti-HIV', 'sorologias', result, date);
            }
        }
    }

    /**
     * Extrai resultado qualitativo de sorologia
     */
    extractSerologyResult(block) {
        const blockUpper = block.toUpperCase();

        // Padrões para identificar resultados qualitativos
        // Ordem importa: verificar "NÃO REAGENTE" antes de "REAGENTE"

        // Verifica "Não Reagente" / "Nao Reagente"
        if (blockUpper.includes('NÃO REAGENTE') || blockUpper.includes('NAO REAGENTE') ||
            blockUpper.includes('AMOSTRA NÃO REAGENTE') || blockUpper.includes('AMOSTRA NAO REAGENTE')) {
            return 'NR';
        }

        // Verifica "Resultado: Não Reagente"
        const resultMatch = block.match(/Resultado:\s*(Não Reagente|Nao Reagente|Reagente|Indeterminado)/i);
        if (resultMatch) {
            const result = resultMatch[1].toUpperCase();
            if (result.includes('NÃO') || result.includes('NAO')) return 'NR';
            if (result === 'REAGENTE') return 'R';
            if (result === 'INDETERMINADO') return 'IND';
        }

        // Verifica apenas "Reagente" (depois de verificar "Não Reagente")
        if (blockUpper.includes('REAGENTE') && !blockUpper.includes('NÃO REAGENTE') && !blockUpper.includes('NAO REAGENTE')) {
            return 'R';
        }

        // Verifica "Indeterminado"
        if (blockUpper.includes('INDETERMINADO')) {
            return 'IND';
        }

        // Verifica "Negativo" / "Positivo"
        if (blockUpper.includes('NEGATIVO') || blockUpper.includes('NEGATIVE')) {
            return 'Neg';
        }
        if (blockUpper.includes('POSITIVO') || blockUpper.includes('POSITIVE')) {
            return 'Pos';
        }

        return null;
    }

    /**
     * Extrai valor de um exame específico
     */
    extractValue(block, examName) {
        const escapedName = examName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Padrões para extrair valores - ordem importa!
        const patterns = [
            // Padrão: NOME_EXAME \t\t VALOR (tabs separando)
            new RegExp(escapedName + '\\s+(<\\s*)?([\\d,\\.]+)', 'i'),
            // Padrão: NOME_EXAME : VALOR
            new RegExp(escapedName + '\\s*:\\s*(<\\s*)?([\\d,\\.]+)', 'i'),
            // Padrão genérico mais flexível com tabs
            new RegExp(escapedName + '[\\t\\s]+(<\\s*)?([\\d,\\.]+)', 'i'),
        ];

        for (const pattern of patterns) {
            const match = block.match(pattern);
            if (match) {
                // match[1] pode ser '<' ou undefined
                // match[2] é o número
                const prefix = match[1] ? '<' : '';
                const value = this.normalizeNumber(match[2] || match[1]);
                return prefix + value;
            }
        }

        return null;
    }

    /**
     * Extrai e armazena um valor usando um padrão específico
     */
    extractAndStore(block, pattern, abbrev, category, date) {
        const match = block.match(pattern);
        if (match) {
            this.storeResult(abbrev, category, this.normalizeNumber(match[1]), date);
        }
    }

    /**
     * Armazena um resultado, verificando se é mais recente
     */
    storeResult(abbrev, category, value, date) {
        const key = `${category}_${abbrev}`;

        // Armazena para a tabela (todos os valores)
        this.allResults.push({ abbrev, category, value, date });

        // Armazena o mais recente para exibição principal
        if (!this.results[key] || this.results[key].date < date) {
            this.results[key] = { abbrev, category, value, date };
            this.examCount++;
        }
    }

    /**
     * Normaliza número (vírgula para ponto)
     */
    normalizeNumber(numStr) {
        return numStr.replace(',', '.');
    }

    /**
     * Formata a saída final
     */
    formatOutput() {
        const output = [];

        // LABORATORIAIS
        output.push('> LABORATORIAIS');

        // Gerais
        const geraisItems = this.getGeraisItems();
        if (geraisItems.length > 0) {
            output.push('- Gerais: ' + geraisItems.join(' | '));
        }

        // Gasometria
        const gasometriaItems = this.getGasometriaItems();
        if (gasometriaItems.length > 0) {
            output.push('- Gasometria: ' + gasometriaItems.join(' | '));
        }

        // Renal (função renal + eletrólitos)
        const renalItems = this.getRenalItems();
        if (renalItems.length > 0) {
            output.push('- Renal: ' + renalItems.join(' | '));
        }

        // Metabólico
        const metabolicoItems = this.getCategoryItems('metabolico');
        if (metabolicoItems.length > 0) {
            output.push('- Metabólico: ' + metabolicoItems.join(' | '));
        }

        // Reumato/autoimune
        const reumatoItems = this.getCategoryItems('reumato');
        if (reumatoItems.length > 0) {
            output.push('- Reumato/autoimune: ' + reumatoItems.join(' | '));
        }

        // Trombofilias
        const trombofiliasItems = this.getCategoryItems('trombofilias');
        if (trombofiliasItems.length > 0) {
            output.push('- Trombofilias: ' + trombofiliasItems.join(' | '));
        }

        // Sorologias (agora após Trombofilias)
        const sorologiasItems = this.getCategoryItems('sorologias');
        if (sorologiasItems.length > 0) {
            output.push('- Sorologias: ' + sorologiasItems.join(' | '));
        }

        // Níveis séricos
        const niveisItems = this.getCategoryItems('niveis');
        if (niveisItems.length > 0) {
            output.push('- Níveis séricos: ' + niveisItems.join(' | '));
        }

        // Cardio
        const cardioItems = this.getCategoryItems('cardio');
        if (cardioItems.length > 0) {
            output.push('- Cardio: ' + cardioItems.join(' | '));
        }

        // Urina 1
        const urina1Items = this.getUrina1Items();
        if (urina1Items.length > 0) {
            output.push('- Urina 1: ' + urina1Items.join(' | '));
        }

        // Outros (exames que não foram exibidos em nenhuma categoria acima)
        const outrosItems = this.getOutrosItems();
        if (outrosItems.length > 0) {
            output.push('- Outros: ' + outrosItems.join(' | '));
        }

        // LCR (agora no final)
        const lcrItems = this.getLCRItems();
        if (lcrItems.length > 0) {
            output.push('');
            output.push('> LCR');
            output.push('- LCR: ' + lcrItems.join(' | '));
        }

        return output.join('\n');
    }

    /**
     * Formata a saída agrupada por data
     * @param {boolean} onlyRecent - Se true, mostra apenas o resultado mais recente de cada exame
     */
    formatOutputByDate(onlyRecent = false) {
        const output = [];
        const categoryMap = {
            'gerais': 'Gerais',
            'renal': 'Renal',
            'gasometria': 'Gasometria',
            'metabolico': 'Metabólico',
            'reumato': 'Reumato/autoimune',
            'trombofilias': 'Trombofilias',
            'sorologias': 'Sorologias',
            'niveis': 'Níveis séricos',
            'cardio': 'Cardio',
            'urina1': 'Urina 1',
            'lcr': 'LCR'
        };

        // Exames que pertencem à categoria Renal (mesmo estando em 'gerais')
        const renalExams = new Set(['Cr', 'Ur', 'Na', 'K', 'Ca', 'CaI', 'Mg', 'P', 'Cl']);

        // Agrupa todos os resultados por categoria e depois por data
        const categorized = {};

        // Se onlyRecent, primeiro encontrar a data mais recente de cada exame
        const mostRecentExam = {};
        if (onlyRecent) {
            for (const result of this.allResults) {
                const examKey = `${result.category}_${result.abbrev}`;
                if (!mostRecentExam[examKey] || result.date > mostRecentExam[examKey]) {
                    mostRecentExam[examKey] = result.date;
                }
            }
        }

        for (const result of this.allResults) {
            let category = result.category;
            if (category === 'ignore' || category === 'leucograma') continue;

            // Redireciona exames renais para a categoria 'renal'
            if (category === 'gerais' && renalExams.has(result.abbrev)) {
                category = 'renal';
            }

            // Se onlyRecent, só inclui se for a data mais recente deste exame
            if (onlyRecent) {
                const examKey = `${result.category}_${result.abbrev}`;
                if (result.date.getTime() !== mostRecentExam[examKey].getTime()) {
                    continue;
                }
            }

            if (!categorized[category]) {
                categorized[category] = {};
            }

            const dateKey = this.formatDateShort(result.date);
            if (!categorized[category][dateKey]) {
                categorized[category][dateKey] = { date: result.date, items: [] };
            }

            categorized[category][dateKey].items.push(`${result.abbrev} ${result.value}`);
        }

        // Adiciona gasometrias
        for (const gasData of this.allGasometrias) {
            const category = 'gasometria';
            if (!categorized[category]) {
                categorized[category] = {};
            }

            // Se onlyRecent, filtra gasometrias também
            if (onlyRecent) {
                // Para gasometrias, verifica se esta é a mais recente do tipo
                const isNewest = !this.allGasometrias.some(g =>
                    g.type === gasData.type && g.date > gasData.date
                );
                if (!isNewest) continue;
            }

            const dateKey = this.formatDateShort(gasData.date);
            if (!categorized[category][dateKey]) {
                categorized[category][dateKey] = { date: gasData.date, items: [] };
            }

            const gasItems = [];
            const prefix = gasData.type;
            if (gasData.pH) gasItems.push(`${prefix}.pH ${gasData.pH}`);
            if (gasData.pO2 && prefix === 'GA') gasItems.push(`${prefix}.pO2 ${gasData.pO2}`);
            if (gasData.pCO2) gasItems.push(`${prefix}.pCO2 ${gasData.pCO2}`);
            if (gasData.BIC) gasItems.push(`${prefix}.BIC ${gasData.BIC}`);
            if (gasData.LAC) gasItems.push(`${prefix}.LAC ${gasData.LAC}`);
            if (gasData.SO2 && prefix === 'GA') gasItems.push(`${prefix}.SO2 ${gasData.SO2}`);

            if (gasItems.length > 0) {
                categorized[category][dateKey].items.push(...gasItems);
            }
        }

        // Formata a saída
        output.push('> LABORATORIAIS');

        const categoryOrder = ['gerais', 'gasometria', 'renal', 'metabolico', 'reumato', 'trombofilias', 'sorologias', 'niveis', 'cardio', 'urina1'];

        for (const cat of categoryOrder) {
            if (!categorized[cat]) continue;

            const categoryName = categoryMap[cat] || cat;
            output.push(`- ${categoryName}:`);

            // Ordena as datas (mais antigas primeiro)
            const dates = Object.entries(categorized[cat])
                .sort((a, b) => a[1].date - b[1].date);

            for (const [dateKey, data] of dates) {
                if (data.items.length > 0) {
                    output.push(`  - ${dateKey}: ${data.items.join(' | ')}`);
                }
            }
        }

        // LCR por data
        if (categorized['lcr']) {
            output.push('');
            output.push('> LCR');
            output.push('- LCR:');

            const dates = Object.entries(categorized['lcr'])
                .sort((a, b) => a[1].date - b[1].date);

            for (const [dateKey, data] of dates) {
                if (data.items.length > 0) {
                    output.push(`  - ${dateKey}: ${data.items.join(' | ')}`);
                }
            }
        }

        return output.join('\n');
    }

    /**
     * Formata data no formato curto (DD/MM/AA)
     */
    formatDateShort(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    /**
     * Obtém itens da categoria LCR (em ordem clínica com formatação especial)
     */
    getLCRItems() {
        const items = [];
        const lcrResults = {};

        // Coleta todos os resultados de LCR
        for (const [key, data] of Object.entries(this.results)) {
            if (data.category === 'lcr') {
                lcrResults[data.abbrev] = data.value;
            }
        }

        // Aspecto (só mostra se não for normal)
        if (lcrResults['Asp']) {
            items.push(`Asp ${lcrResults['Asp']}`);
        }

        // Celularidade com diferencial entre parênteses
        if (lcrResults['Cel']) {
            let celStr = `Cel ${lcrResults['Cel']}`;
            if (lcrResults['Dif']) {
                // Formata diferencial: "Ly 88% Mo 12%" -> "(Linf 88%, Mono 12%)"
                let dif = lcrResults['Dif'];
                dif = dif.replace(/Ly\s*/g, 'Linf ').replace(/Mo\s*/g, 'Mono ').replace(/N\s*/g, 'Neutro ');
                dif = dif.replace(/\s+/g, ' ').trim();
                // Adiciona vírgulas entre os componentes
                dif = dif.replace(/(\d+%)\s+/g, '$1, ');
                celStr += ` (${dif})`;
            }
            items.push(celStr);
        }

        // Hemácias (sempre mostra se existe valor)
        if (lcrResults['Hem'] !== undefined) {
            items.push(`Hem ${lcrResults['Hem']}`);
        }

        // Proteínas
        if (lcrResults['PT']) {
            items.push(`Pt ${lcrResults['PT']}`);
        }

        // Glicose
        if (lcrResults['Glico']) {
            items.push(`Glico ${lcrResults['Glico']}`);
        }

        // Lactato
        if (lcrResults['Lac']) {
            items.push(`Lac ${lcrResults['Lac']}`);
        }

        // ADA
        if (lcrResults['ADA']) {
            items.push(`ADA ${lcrResults['ADA']}`);
        }

        // Gram
        if (lcrResults['Gram']) {
            items.push(`Gram ${lcrResults['Gram']}`);
        }

        // GeneXpert
        if (lcrResults['GeneXpert']) {
            items.push(`GeneXpert ${lcrResults['GeneXpert']}`);
        }

        // BAAR
        if (lcrResults['pBAAR']) {
            items.push(`pBAAR ${lcrResults['pBAAR']}`);
        }

        // Culturas - separar micobactérias das outras (demora mais)
        if (lcrResults['Cult']) {
            if (lcrResults['Cult'] === 'Neg') {
                items.push('Cultura negativa');
            } else if (lcrResults['Cult'] === 'Parcial Neg') {
                items.push('Cultura parcial negativa');
            } else {
                items.push(`Cultura: ${lcrResults['Cult']}`);
            }
        }

        // Cultura para micobactérias (separada)
        if (lcrResults['CultMTB']) {
            if (lcrResults['CultMTB'] === 'Neg') {
                items.push('Cultura micobactéria negativa');
            } else if (lcrResults['CultMTB'] === 'Parcial Neg') {
                items.push('Cultura micobactéria parcial negativa');
            } else {
                items.push(`Cultura micobactéria: ${lcrResults['CultMTB']}`);
            }
        }

        // Painel viral - baseado no tracking de lcrData
        // Os 10 vírus do painel: HSV1, HSV2, VZV, CMV, EBV, HHV6, HHV7, EV, AdV, B19
        // Sempre mostrar quando houver qualquer exame de LCR
        const COMPLETE_VIRAL_PANEL = ['HSV1', 'HSV2', 'VZV', 'CMV', 'EBV', 'HHV6', 'HHV7', 'EV', 'AdV', 'B19'];
        const hasAnyLCRResults = Object.keys(lcrResults).length > 0;

        if (hasAnyLCRResults) {
            if (this.lcrData.viralTested && this.lcrData.viralTested.length > 0) {
                const testedCount = this.lcrData.viralTested.length;
                const totalViruses = COMPLETE_VIRAL_PANEL.length;
                const hasPositive = this.lcrData.viralPositive && this.lcrData.viralPositive.length > 0;

                if (testedCount >= totalViruses) {
                    // Painel completo
                    if (hasPositive) {
                        items.push(`Painel viral: ${this.lcrData.viralPositive.join(', ')}`);
                    } else {
                        items.push('Painel viral negativo');
                    }
                } else {
                    // Painel incompleto - aguarda resultado
                    const testedNegative = this.lcrData.viralTested.filter(v =>
                        !this.lcrData.viralPositive || !this.lcrData.viralPositive.some(p => p.startsWith(v))
                    );
                    const partialResults = [];
                    if (hasPositive) {
                        partialResults.push(...this.lcrData.viralPositive);
                    }
                    if (testedNegative.length > 0) {
                        partialResults.push(...testedNegative.map(v => `${v}-`));
                    }

                    if (partialResults.length > 0) {
                        items.push(`Painel viral: aguarda resultado (${partialResults.join(', ')})`);
                    } else {
                        items.push(`Painel viral: aguarda resultado`);
                    }
                }
            } else {
                // Nenhum teste viral encontrado ainda - aguarda resultado
                items.push('Painel viral: aguarda resultado');
            }
        }

        // Citologia oncótica
        if (lcrResults['CitoOnco']) {
            items.push(`CitoOnco ${lcrResults['CitoOnco']}`);
        }

        // Bandas oligoclonais
        if (lcrResults['BOC']) {
            items.push(`BOC ${lcrResults['BOC']}`);
        }

        return items;
    }

    /**
     * Obtém itens da categoria Gerais (hemograma + gasometria + hepáticos + coagulação)
     */
    getGeraisItems() {
        const items = [];

        // Hemoglobina com VCM entre parênteses
        const hb = this.findResult('gerais', 'Hb');
        const vcm = this.findResult('gerais', 'VCM');
        if (hb) {
            let hbStr = `Hb ${hb}`;
            if (vcm) {
                hbStr += ` (VCM ${vcm})`;
            }
            items.push(hbStr);
        }

        // Hematócrito
        const ht = this.findResult('gerais', 'Ht');
        if (ht) items.push(`Ht ${ht}`);

        // Leucócitos com diferencial
        const leuco = this.findResult('gerais', 'Leuco');
        if (leuco) {
            let leucoStr = `Leuco ${leuco}`;
            const diffParts = [];
            if (this.leucograma.N) diffParts.push(`N ${this.leucograma.N}`);
            if (this.leucograma.Ly) diffParts.push(`Ly ${this.leucograma.Ly}`);
            if (this.leucograma.Mo) diffParts.push(`Mo ${this.leucograma.Mo}`);
            if (this.leucograma.Eo) diffParts.push(`Eo ${this.leucograma.Eo}`);
            if (diffParts.length > 0) {
                leucoStr += ` (${diffParts.join(' / ')})`;
            }
            items.push(leucoStr);
        }

        // Plaquetas
        const plaq = this.findResult('gerais', 'Plaq');
        if (plaq) items.push(`Plaq ${plaq}`);

        // Hepáticos
        const ast = this.findResult('gerais', 'AST');
        if (ast) items.push(`AST ${ast}`);

        const alt = this.findResult('gerais', 'ALT');
        if (alt) items.push(`ALT ${alt}`);

        const bt = this.findResult('gerais', 'BT');
        if (bt) items.push(`BT ${bt}`);

        const bd = this.findResult('gerais', 'BD');
        if (bd) items.push(`BD ${bd}`);

        const pt = this.findResult('gerais', 'PT');
        if (pt) items.push(`PT ${pt}`);

        const alb = this.findResult('gerais', 'ALB');
        if (alb) items.push(`ALB ${alb}`);

        // Coagulação
        const inr = this.findResult('gerais', 'INR');
        if (inr) items.push(`INR ${inr}`);

        const r = this.findResult('gerais', 'R');
        if (r) items.push(`R ${r}`);

        const fa = this.findResult('gerais', 'FA');
        if (fa) items.push(`FA ${fa}`);

        const ggt = this.findResult('gerais', 'GGT');
        if (ggt) items.push(`GGT ${ggt}`);

        const amil = this.findResult('gerais', 'AMIL');
        if (amil) items.push(`AMIL ${amil}`);

        const lip = this.findResult('gerais', 'LIP');
        if (lip) items.push(`LIP ${lip}`);

        return items;
    }

    /**
     * Obtém itens da categoria Gasometria (venosa e arterial)
     */
    getGasometriaItems() {
        const items = [];

        // Gasometria Venosa
        if (Object.keys(this.gasometriaVenosa).length > 1) {
            if (this.gasometriaVenosa.pH) items.push(`GV.pH ${this.gasometriaVenosa.pH}`);
            if (this.gasometriaVenosa.pCO2) items.push(`GV.pCO2 ${this.gasometriaVenosa.pCO2}`);
            if (this.gasometriaVenosa.BIC) items.push(`GV.BIC ${this.gasometriaVenosa.BIC}`);
            if (this.gasometriaVenosa.LAC) items.push(`GV.LAC ${this.gasometriaVenosa.LAC}`);
        }

        // Gasometria Arterial
        if (Object.keys(this.gasometriaArterial).length > 1) {
            if (this.gasometriaArterial.pH) items.push(`GA.pH ${this.gasometriaArterial.pH}`);
            if (this.gasometriaArterial.pO2) items.push(`GA.pO2 ${this.gasometriaArterial.pO2}`);
            if (this.gasometriaArterial.pCO2) items.push(`GA.pCO2 ${this.gasometriaArterial.pCO2}`);
            if (this.gasometriaArterial.BIC) items.push(`GA.BIC ${this.gasometriaArterial.BIC}`);
            if (this.gasometriaArterial.LAC) items.push(`GA.LAC ${this.gasometriaArterial.LAC}`);
            if (this.gasometriaArterial.SO2) items.push(`GA.SO2 ${this.gasometriaArterial.SO2}`);
        }

        return items;
    }

    /**
     * Obtém itens da categoria Renal (função renal + eletrólitos)
     */
    getRenalItems() {
        const items = [];

        // Creatinina
        const cr = this.findResult('gerais', 'Cr');
        if (cr) items.push(`Cr ${cr}`);

        // Uréia
        const ur = this.findResult('gerais', 'Ur');
        if (ur) items.push(`Ur ${ur}`);

        // Sódio
        const na = this.findResult('gerais', 'Na');
        if (na) items.push(`Na ${na}`);

        // Potássio
        const k = this.findResult('gerais', 'K');
        if (k) items.push(`K ${k}`);

        // Cloro
        const cl = this.findResult('gerais', 'Cl');
        if (cl) items.push(`Cl ${cl}`);

        // Cálcio
        const ca = this.findResult('gerais', 'Ca') || this.findResult('gerais', 'CaI');
        if (ca) items.push(`Ca ${ca}`);

        // Fósforo
        const p = this.findResult('gerais', 'P');
        if (p) items.push(`P ${p}`);

        // Magnésio
        const mg = this.findResult('gerais', 'Mg');
        if (mg) items.push(`Mg ${mg}`);

        return items;
    }

    /**
     * Obtém itens de uma categoria específica NA ORDEM DEFINIDA
     */
    getCategoryItems(category) {
        // Ordem específica para cada categoria
        const orderMap = {
            'sorologias': ['HepB.Anti-HBc', 'HepB.Anti-HBs', 'HepB.Ag-HBs', 'HepB.Ag-HBe', 'HepC', 'Anti-HIV', 'VDRL', 'CMV.IgG', 'CMV.IgM', 'VZV.IgG', 'VZV.IgM', 'HSV.IgG', 'HSV.IgM', 'HTLV.IgG', 'HTLV.IgM', 'TOXO.IgG', 'TOXO.IgM'],
            'metabolico': ['Glic', 'HbGlic', 'HDL', 'LDL', 'VLDL', 'ColT', 'Trig', 'TSH', 'T4L', 'B12', 'AF', 'VitD', 'PTH', 'CPK', 'Fe', 'Ferritina', 'CTLF', 'STf', 'DHL'],
            'reumato': ['PCR', 'VHS', 'FR', 'FAN', 'Anti-Ro', 'Anti-La', 'Anti-MPO', 'Anti-PR3', 'anti-dsDNA', 'anti-Sm', 'C3', 'C4', 'IFS', 'EFPS', 'Igk', 'Igl', 'RKL'],
            'trombofilias': ['Anticoagulante lúpico', 'Anticardiolipina IgG', 'Anticardiolipina IgM', 'Anti-beta-2-glicoproteína', 'Proteína C', 'Proteína S', 'Antitrombina III', 'Mutação fator V de Leiden', 'Mutação de protrombina', 'Dosagem de homocisteína', 'EFH', 'DD', 'Fibrinogênio'],
            'niveis': ['VPA', 'PHT', 'LEV', 'CBZ', 'PB', 'LTG'],
            'cardio': ['Tropo-T', 'NT-proBNP']
        };

        const order = orderMap[category] || [];
        const items = [];

        // Primeiro adiciona os itens na ordem definida
        for (const abbrev of order) {
            const result = this.findResult(category, abbrev);
            if (result !== null) {
                items.push(`${abbrev} ${result}`);
            }
        }

        // Depois adiciona quaisquer itens que não estejam na ordem (caso existam)
        for (const [key, data] of Object.entries(this.results)) {
            if (data.category === category && !order.includes(data.abbrev)) {
                items.push(`${data.abbrev} ${data.value}`);
            }
        }

        return items;
    }

    /**
     * Obtém itens de Urina Tipo 1 em ordem clínica
     */
    getUrina1Items() {
        const order = ['U1.Leuco', 'U1.Eritro', 'U1.Prot', 'U1.Nit', 'U1.LeucoEst', 'U1.Urobil', 'U1.pH', 'U1.Dens', 'U1.Glic', 'U1.Sangue', 'U1.Ceto'];
        const items = [];

        for (const abbrev of order) {
            const result = this.findResult('urina1', abbrev);
            if (result !== null) {
                items.push(`${abbrev} ${result}`);
            }
        }

        // Adiciona quaisquer outros itens de urina1 não na lista
        for (const [key, data] of Object.entries(this.results)) {
            if (data.category === 'urina1' && !order.includes(data.abbrev)) {
                items.push(`${data.abbrev} ${data.value}`);
            }
        }

        return items;
    }

    /**
     * Obtém exames que não foram exibidos em nenhuma das categorias principais
     */
    getOutrosItems() {
        // Lista de exames que já são tratados nas categorias específicas
        const geraisExams = ['Hb', 'VCM', 'Ht', 'Leuco', 'Plaq', 'AST', 'ALT', 'BT', 'BD', 'INR', 'R', 'FA', 'GGT', 'AMIL', 'LIP', 'ALB', 'PT'];
        const renalExams = ['Cr', 'Ur', 'Na', 'K', 'Cl', 'Ca', 'CaI', 'P', 'Mg'];
        const metabolicoExams = ['Glic', 'HbGlic', 'HDL', 'LDL', 'VLDL', 'ColT', 'Trig', 'TSH', 'T4L', 'B12', 'AF', 'VitD', 'PTH', 'CPK', 'Fe', 'Ferritina', 'CTLF', 'STf', 'DHL'];
        const sorologiasExams = ['HepB.Anti-HBc', 'HepB.Anti-HBs', 'HepB.Ag-HBs', 'HepB.Ag-HBe', 'HepC', 'Anti-HIV', 'VDRL', 'CMV.IgG', 'CMV.IgM', 'VZV.IgG', 'VZV.IgM', 'HSV.IgG', 'HSV.IgM', 'HTLV.IgG', 'HTLV.IgM', 'TOXO.IgG', 'TOXO.IgM'];
        const reumatoExams = ['PCR', 'VHS', 'FR', 'FAN', 'Anti-Ro', 'Anti-La', 'Anti-MPO', 'Anti-PR3', 'anti-dsDNA', 'anti-Sm', 'C3', 'C4', 'IFS', 'EFPS', 'Igk', 'Igl', 'RKL'];
        const trombofiliasExams = ['Anticoagulante lúpico', 'Anticardiolipina IgG', 'Anticardiolipina IgM', 'Anti-beta-2-glicoproteína', 'Proteína C', 'Proteína S', 'Antitrombina III', 'Mutação fator V de Leiden', 'Mutação de protrombina', 'Dosagem de homocisteína', 'EFH', 'DD', 'Fibrinogênio'];
        const niveisExams = ['VPA', 'PHT', 'LEV', 'CBZ', 'PB', 'LTG'];
        const cardioExams = ['Tropo-T', 'NT-proBNP'];
        const lcrExams = ['PT', 'Glico', 'Lac', 'ADA', 'Cel', 'Hem', 'Dif', 'Asp', 'Gram', 'Cult', 'CultMTB', 'pBAAR', 'GeneXpert', 'CitoOnco', 'BOC'];
        const leucogramaExams = ['N', 'Ly', 'Mo', 'Eo'];
        const urina1Exams = ['U1.Leuco', 'U1.Eritro', 'U1.Prot', 'U1.Nit', 'U1.LeucoEst', 'U1.Urobil', 'U1.pH', 'U1.Dens', 'U1.Glic', 'U1.Sangue', 'U1.Ceto'];

        // Combina todos os exames tratados
        const handledExams = new Set([
            ...geraisExams,
            ...renalExams,
            ...metabolicoExams,
            ...sorologiasExams,
            ...reumatoExams,
            ...trombofiliasExams,
            ...niveisExams,
            ...cardioExams,
            ...lcrExams,
            ...leucogramaExams,
            ...urina1Exams
        ]);

        const items = [];

        // Encontra exames que não estão na lista de tratados
        for (const [key, data] of Object.entries(this.results)) {
            // Ignora categorias especiais
            if (data.category === 'lcr' || data.category === 'ignore' || data.category === 'leucograma' || data.category === 'urina1') {
                continue;
            }

            if (!handledExams.has(data.abbrev)) {
                items.push(`${data.abbrev} ${data.value}`);
            }
        }

        return items;
    }

    /**
     * Encontra resultado por categoria e abreviação
     */
    findResult(category, abbrev) {
        const key = `${category}_${abbrev}`;
        return this.results[key]?.value || null;
    }

    /**
     * Retorna estatísticas
     */
    getStats() {
        return {
            totalExams: Object.keys(this.results).length +
                Object.keys(this.gasometriaVenosa).length +
                Object.keys(this.gasometriaArterial).length,
            mostRecentDate: this.mostRecentDate
        };
    }

    /**
     * Retorna dados estruturados para a tabela
     * Agrupa por data (apenas dia, ignora horário)
     * Usa allResults para ter TODOS os valores de todos os dias
     */
    getTableData() {
        const tableData = {}; // { 'dd/mm': { 'ExamName': value } }
        const allExams = new Set();

        // Processa TODOS os resultados (não apenas o mais recente)
        for (const data of this.allResults) {
            if (data.date) {
                const dateKey = this.formatDateKey(data.date);
                if (!tableData[dateKey]) tableData[dateKey] = {};

                // Se já existe um valor para este exame nesta data, mantém o mais recente do dia
                if (!tableData[dateKey][data.abbrev] || data.date > tableData[dateKey][data.abbrev].date) {
                    tableData[dateKey][data.abbrev] = { value: data.value, date: data.date };
                }
                allExams.add(data.abbrev);
            }
        }

        // Processa TODAS as gasometrias
        for (const gasData of this.allGasometrias) {
            if (gasData.date) {
                const dateKey = this.formatDateKey(gasData.date);
                if (!tableData[dateKey]) tableData[dateKey] = {};

                for (const [param, value] of Object.entries(gasData)) {
                    if (param !== 'date' && param !== 'type' && value) {
                        const examName = `${gasData.type}.${param}`;
                        if (!tableData[dateKey][examName] || gasData.date > tableData[dateKey][examName].date) {
                            tableData[dateKey][examName] = { value, date: gasData.date };
                        }
                        allExams.add(examName);
                    }
                }
            }
        }

        // Simplifica tableData removendo o objeto date
        const simplifiedData = {};
        for (const [dateKey, exams] of Object.entries(tableData)) {
            simplifiedData[dateKey] = {};
            for (const [examName, examData] of Object.entries(exams)) {
                simplifiedData[dateKey][examName] = examData.value;
            }
        }


        return {
            dates: Object.keys(simplifiedData),
            exams: Array.from(allExams),
            data: simplifiedData
        };
    }

    formatDateKey(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}

// ===== INICIALIZAÇÃO DA UI =====
document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('inputData');
    const processBtn = document.getElementById('processBtn');
    const tableBtn = document.getElementById('tableBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyTableBtn = document.getElementById('copyTableBtn');
    const toggleOrderBtn = document.getElementById('toggleOrderBtn');
    const orderLabel = document.getElementById('orderLabel');
    const resultPlaceholder = document.getElementById('resultPlaceholder');
    const resultContent = document.getElementById('resultContent');
    const statsSection = document.getElementById('statsSection');
    const tableSection = document.getElementById('tableSection');
    const tableContainer = document.getElementById('tableContainer');
    const statTotal = document.getElementById('statTotal');
    const statDate = document.getElementById('statDate');
    const toast = document.getElementById('toast');

    const parser = new ExamParser();
    let isAscending = true; // true = antigo -> recente
    let currentTableData = null;
    let isHighlightActive = false;
    let isDateGroupActive = false;
    let isOnlyRecentActive = false;
    const highlightBtn = document.getElementById('highlightBtn');
    const dateGroupBtn = document.getElementById('dateGroupBtn');
    const onlyRecentBtn = document.getElementById('onlyRecentBtn');

    // Função para renderizar o resultado com as opções ativas
    function renderResult() {
        const rawText = inputData.value.trim();
        if (!rawText) return;

        try {
            parser.parse(rawText);
            const stats = parser.getStats();

            let result;
            if (isDateGroupActive) {
                result = parser.formatOutputByDate(isOnlyRecentActive);
            } else {
                result = parser.formatOutput();
            }

            // Atualiza a UI
            resultPlaceholder.style.display = 'none';
            resultContent.textContent = result;
            resultContent.classList.add('active');

            // Aplica highlighting se estiver ativo
            if (isHighlightActive) {
                applyTextHighlighting();
            }

            // Mostra estatísticas
            statsSection.style.display = 'block';
            statTotal.textContent = stats.totalExams;
            statDate.textContent = stats.mostRecentDate
                ? formatDate(stats.mostRecentDate)
                : '-';

            return true;
        } catch (error) {
            console.error('Erro ao processar:', error);
            return false;
        }
    }

    // Processar exames
    processBtn.addEventListener('click', () => {
        const rawText = inputData.value.trim();

        if (!rawText) {
            showToast('Por favor, cole os dados dos exames primeiro.', 'warning');
            return;
        }

        if (renderResult()) {
            showToast('Exames processados com sucesso!', 'success');
        } else {
            showToast('Erro ao processar os dados. Verifique o formato.', 'error');
        }
    });

    // Gerar tabela
    tableBtn.addEventListener('click', () => {
        const rawText = inputData.value.trim();

        if (!rawText) {
            showToast('Por favor, cole os dados dos exames primeiro.', 'warning');
            return;
        }

        try {
            // Parse se ainda não foi feito
            parser.parse(rawText);
            currentTableData = parser.getTableData();

            renderTable(currentTableData, isAscending);
            tableSection.style.display = 'block';
            showToast('Tabela gerada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao gerar tabela:', error);
            showToast('Erro ao gerar a tabela. Verifique o formato.', 'error');
        }
    });

    // Toggle ordem das datas
    toggleOrderBtn.addEventListener('click', () => {
        isAscending = !isAscending;
        orderLabel.textContent = isAscending ? 'Antigo → Recente' : 'Recente → Antigo';

        if (currentTableData) {
            renderTable(currentTableData, isAscending);
        }
    });

    // Renderiza a tabela HTML
    function renderTable(tableData, ascending) {
        const { dates, exams, data } = tableData;

        if (dates.length === 0 || exams.length === 0) {
            tableContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhum dado para exibir.</p>';
            return;
        }

        // Ordena as datas considerando o ano completo
        const sortedDates = [...dates].sort((a, b) => {
            const partsA = a.split('/').map(Number);
            const partsB = b.split('/').map(Number);
            // Formato: dd/mm/yyyy
            const dateA = new Date(partsA[2] || 2025, partsA[1] - 1, partsA[0]);
            const dateB = new Date(partsB[2] || 2025, partsB[1] - 1, partsB[0]);
            return ascending ? dateA - dateB : dateB - dateA;
        });

        // Define categorias com seus exames
        const categories = getExamCategories();

        // Gera HTML da tabela
        let html = '<table class="exam-table"><thead><tr>';
        html += '<th>Exame</th>';

        // Formata cabeçalhos das datas (dd/mm somente para exibição)
        for (const date of sortedDates) {
            const parts = date.split('/');
            const displayDate = `${parts[0]}/${parts[1]}`;
            html += `<th>${displayDate}</th>`;
        }
        html += '</tr></thead><tbody>';

        // Itera por categoria
        for (const category of categories) {
            // Verifica se há exames desta categoria nos dados
            const categoryExams = category.exams.filter(exam => exams.includes(exam));

            if (categoryExams.length > 0) {
                // Adiciona linha de cabeçalho da categoria
                html += `<tr class="category-header"><td colspan="${sortedDates.length + 1}">${category.name}</td></tr>`;

                // Adiciona exames da categoria
                for (const exam of categoryExams) {
                    html += '<tr>';
                    html += `<td>${exam}</td>`;

                    for (const date of sortedDates) {
                        const value = data[date]?.[exam] || '';
                        // Adiciona atributos de dados para permitir highlight dinâmico
                        const abnormalClass = isHighlightActive && value && isAbnormal(exam, value) ? ' class="abnormal"' : '';
                        html += `<td data-exam="${exam}" data-value="${value}"${abnormalClass}>${value}</td>`;
                    }
                    html += '</tr>';
                }
            }
        }

        // Adiciona exames que não estão em nenhuma categoria conhecida
        const allCategoryExams = categories.flatMap(c => c.exams);
        const uncategorizedExams = exams.filter(e => !allCategoryExams.includes(e));

        if (uncategorizedExams.length > 0) {
            html += `<tr class="category-header"><td colspan="${sortedDates.length + 1}">Outros</td></tr>`;
            for (const exam of uncategorizedExams) {
                html += '<tr>';
                html += `<td>${exam}</td>`;
                for (const date of sortedDates) {
                    const value = data[date]?.[exam] || '';
                    const abnormalClass = isHighlightActive && value && isAbnormal(exam, value) ? ' class="abnormal"' : '';
                    html += `<td data-exam="${exam}" data-value="${value}"${abnormalClass}>${value}</td>`;
                }
                html += '</tr>';
            }
        }

        html += '</tbody></table>';
        tableContainer.innerHTML = html;
    }

    // Categorias de exames com ordem definida
    function getExamCategories() {
        return [
            {
                name: 'GERAIS',
                exams: ['Hb', 'Ht', 'VCM', 'Leuco', 'Plaq']
            },
            {
                name: 'RENAL',
                exams: ['Cr', 'Ur', 'Na', 'K', 'Cl', 'Ca', 'CaI', 'P', 'Mg']
            },
            {
                name: 'GASOMETRIA VENOSA',
                exams: ['GV.pH', 'GV.pCO2', 'GV.pO2', 'GV.BIC', 'GV.LAC', 'GV.SO2']
            },
            {
                name: 'GASOMETRIA ARTERIAL',
                exams: ['GA.pH', 'GA.pO2', 'GA.pCO2', 'GA.BIC', 'GA.AG', 'GA.LAC', 'GA.SO2']
            },
            {
                name: 'HEPÁTICOS',
                exams: ['TGO', 'TGP', 'BT', 'BD', 'PT', 'ALB', 'FA', 'GGT', 'AMIL', 'LIP']
            },
            {
                name: 'COAGULAÇÃO',
                exams: ['INR', 'R', 'DD', 'Fibrinogênio']
            },
            {
                name: 'METABÓLICO',
                exams: ['Glic', 'HbGlic', 'HDL', 'LDL', 'VLDL', 'ColT', 'Trig', 'TSH', 'T4L', 'B12', 'AF', 'VitD', 'PTH', 'CPK', 'Fe', 'Ferritina', 'CTLF', 'STf', 'DHL']
            },
            {
                name: 'REUMATO/INFLAMATÓRIO',
                exams: ['PCR', 'VHS', 'FR', 'FAN', 'Anti-Ro', 'Anti-La', 'Anti-MPO', 'Anti-PR3', 'anti-dsDNA', 'anti-Sm', 'C3', 'C4', 'IFS', 'EFPS', 'Igk', 'Igl', 'RKL']
            },
            {
                name: 'TROMBOFILIAS',
                exams: ['Anticoagulante lúpico', 'Anticardiolipina IgG', 'Anticardiolipina IgM', 'Anti-beta-2-glicoproteína', 'Proteína C', 'Proteína S', 'Antitrombina III']
            },
            {
                name: 'SOROLOGIAS',
                exams: ['HepB.Anti-HBc', 'HepB.Anti-HBs', 'HepB.Ag-HBs', 'HepB.Ag-HBe', 'HepC', 'Anti-HIV', 'VDRL', 'CMV.IgG', 'CMV.IgM', 'VZV.IgG', 'VZV.IgM', 'HSV.IgG', 'HSV.IgM', 'HTLV.IgG', 'HTLV.IgM', 'TOXO.IgG', 'TOXO.IgM']
            },
            {
                name: 'NÍVEIS SÉRICOS',
                exams: ['VPA', 'PHT', 'LEV', 'CBZ', 'PB', 'LTG']
            },
            {
                name: 'CARDIO',
                exams: ['Tropo-T', 'NT-proBNP']
            },
            {
                name: 'LCR',
                exams: ['Cel', 'Hem', 'Dif', 'PT', 'Glico', 'Lac', 'ADA', 'Asp', 'Gram', 'Cult', 'CultMTB', 'pBAAR', 'GeneXpert', 'CitoOnco', 'BOC']
            }
        ];
    }

    // Ordem dos exames para ordenação (mantém para compatibilidade)
    function getExamOrder() {
        return getExamCategories().flatMap(c => c.exams);
    }

    // Limpar
    clearBtn.addEventListener('click', () => {
        inputData.value = '';
        resultPlaceholder.style.display = 'block';
        resultContent.textContent = '';
        resultContent.classList.remove('active');
        statsSection.style.display = 'none';
        tableSection.style.display = 'none';
        tableContainer.innerHTML = '';
        currentTableData = null;
    });

    // Copiar resultado com formatação (fonte Arial 11, valores alterados em vermelho)
    copyBtn.addEventListener('click', async () => {
        const text = resultContent.textContent;

        if (!text) {
            showToast('Nenhum resultado para copiar.', 'warning');
            return;
        }

        try {
            // Obtém o HTML interno e aplica estilos inline para preservar formatação ao colar
            let htmlContent = resultContent.innerHTML;

            // Substitui os spans abnormal por spans com estilo inline vermelho
            htmlContent = htmlContent.replace(
                /<span class="abnormal">([^<]+)<\/span>/g,
                '<span style="color: red;">$1</span>'
            );

            // Coloca linhas que começam com ">" em negrito (cabeçalhos como "> LABORATORIAIS")
            htmlContent = htmlContent.replace(
                /(&gt;[^\n<]+)/g,
                '<b>$1</b>'
            );

            // Converte quebras de linha em tags <br> para preservar no HTML
            htmlContent = htmlContent.replace(/\n/g, '<br>');

            // Envolve todo o conteúdo com fonte Arial 11
            const formattedHtml = `<div style="font-family: Arial, sans-serif; font-size: 11pt;">${htmlContent}</div>`;

            // Cria blobs para HTML e texto
            const htmlBlob = new Blob([formattedHtml], { type: 'text/html' });
            const textBlob = new Blob([text], { type: 'text/plain' });

            // Copia com a API Clipboard usando ClipboardItem
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': htmlBlob,
                    'text/plain': textBlob
                })
            ]);

            showToast('Copiado para a área de transferência!', 'success');
        } catch (error) {
            // Fallback para navegadores que não suportam clipboard.write
            fallbackCopyWithFormatting(resultContent.innerHTML, text);
        }
    });

    // Copiar tabela
    copyTableBtn.addEventListener('click', async () => {
        const table = tableContainer.querySelector('table');

        if (!table) {
            showToast('Nenhuma tabela para copiar.', 'warning');
            return;
        }

        // Cria texto tabulado para colar em Excel/Sheets
        let text = '';
        const rows = table.querySelectorAll('tr');

        for (const row of rows) {
            const cells = row.querySelectorAll('th, td');
            const rowData = [];
            for (const cell of cells) {
                rowData.push(cell.textContent);
            }
            text += rowData.join('\t') + '\n';
        }

        try {
            await navigator.clipboard.writeText(text);
            showToast('Tabela copiada! Cole em Excel ou Google Sheets.', 'success');
        } catch (error) {
            fallbackCopy(text);
        }
    });

    // Marcar exames alterados
    highlightBtn.addEventListener('click', () => {
        isHighlightActive = !isHighlightActive;
        highlightBtn.classList.toggle('highlight-active', isHighlightActive);
        highlightBtn.textContent = isHighlightActive ? 'Remover Marcação' : 'Marcar Alterados';

        // Re-renderiza a tabela se existir
        if (currentTableData) {
            renderTable(currentTableData, isAscending);
        }

        // Aplica highlight no resultado textual
        applyTextHighlighting();
    });

    // Separar por data
    dateGroupBtn.addEventListener('click', () => {
        isDateGroupActive = !isDateGroupActive;
        dateGroupBtn.classList.toggle('highlight-active', isDateGroupActive);
        dateGroupBtn.textContent = isDateGroupActive ? 'Agrupar Recentes' : 'Separar por Data';

        // Mostra ou esconde o botão "Apenas Recentes"
        if (isDateGroupActive) {
            onlyRecentBtn.style.display = 'inline-block';
        } else {
            onlyRecentBtn.style.display = 'none';
            isOnlyRecentActive = false;
            onlyRecentBtn.classList.remove('highlight-active');
            onlyRecentBtn.textContent = 'Apenas Recentes';
        }

        // Re-renderiza o resultado se houver dados
        if (resultContent.textContent) {
            renderResult();
        }
    });

    // Apenas resultados mais recentes
    onlyRecentBtn.addEventListener('click', () => {
        isOnlyRecentActive = !isOnlyRecentActive;
        onlyRecentBtn.classList.toggle('highlight-active', isOnlyRecentActive);
        onlyRecentBtn.textContent = isOnlyRecentActive ? 'Mostrar Todos' : 'Apenas Recentes';

        // Re-renderiza o resultado se houver dados
        if (resultContent.textContent) {
            renderResult();
        }
    });

    // Aplica destaque nos resultados textuais
    function applyTextHighlighting() {
        const lines = resultContent.innerHTML.split('\n');
        const processedLines = lines.map(line => {
            if (!isHighlightActive) {
                // Remove spans de highlight
                return line.replace(/<span class="abnormal">([^<]+)<\/span>/g, '$1');
            }

            // Procura por padrões como "Na 145" ou "Cr 1.8"
            return line.replace(/\b([A-Za-z]+(?:\.[A-Za-z]+)?)\s+([\d,\.]+(?:\s*[a-z%\/]+)?)/gi, (match, exam, value) => {
                if (isAbnormal(exam.trim(), value.trim())) {
                    return `<span class="abnormal">${exam} ${value}</span>`;
                }
                return match;
            });
        });
        resultContent.innerHTML = processedLines.join('\n');
    }

    // Fallback para copiar texto simples
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copiado para a área de transferência!', 'success');
    }

    // Fallback para copiar com formatação HTML
    function fallbackCopyWithFormatting(htmlContent, plainText) {
        // Aplica estilos inline para preservar formatação
        htmlContent = htmlContent.replace(
            /<span class="abnormal">([^<]+)<\/span>/g,
            '<span style="color: red;">$1</span>'
        );

        // Coloca linhas que começam com ">" em negrito
        htmlContent = htmlContent.replace(
            /(&gt;[^\n<]+)/g,
            '<b>$1</b>'
        );

        // Converte quebras de linha em tags <br>
        htmlContent = htmlContent.replace(/\n/g, '<br>');

        const formattedHtml = `<div style="font-family: Arial, sans-serif; font-size: 11pt;">${htmlContent}</div>`;

        // Cria um elemento temporário com o HTML formatado
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedHtml;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        // Seleciona o conteúdo e copia
        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        document.execCommand('copy');

        selection.removeAllRanges();
        document.body.removeChild(tempDiv);
        showToast('Copiado para a área de transferência!', 'success');
    }

    // Função para mostrar toast
    function showToast(message, type = 'success') {
        toast.querySelector('.toast-message').textContent = message;
        toast.querySelector('.toast-icon').textContent = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';
        toast.style.background = type === 'success' ? 'var(--success-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)';
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Função para formatar data
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }
});
