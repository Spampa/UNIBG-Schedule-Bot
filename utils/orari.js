const axios = require('axios');

async function getOrari() {
    const formData = new FormData();

    const date = '25-09-2024';
    //init form data
    formData.append('view', 'easycourse');
    formData.append('form-type', 'corso');
    formData.append('include', 'corso');
    formData.append('anno', '2024');
    formData.append('scuola', 'ScuoladiIngegneria');
    formData.append('corso', '21-270');
    formData.append('date', date);
    formData.append('_lang', 'it');
    formData.append('txtcurr', '1 - PERCORSO COMUNE');
    formData.append('anno2[]', 'PDS0-2012|1');
    formData.append('visualizzazione_orario', 'cal');

    const orario = [];
    const data = (await axios.post('https://logistica.unibg.it/PortaleStudenti/grid_call.php', formData)).data;

    for (const subject of data.celle) {
        if(subject.data === date && subject.Annullato === '0'){
            orario.push({
                subject: subject.nome_insegnamento,
                date: subject.data,
                schedule: subject.orario,
                classroom: subject.aula,
            });
        }
    }

    return orario;
}

module.exports = {
    getOrari
}