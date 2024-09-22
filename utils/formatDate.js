export function formatDate(addDays = 0){
    let date = new Date();
    date.setDate(date.getDate() + addDays);
    date = date.toLocaleDateString('it-IT');
    date = date.split('/');
    date[1].length === 1 ? date[1] = '0' + date[1] : date[1];
    date = `${date[0]}-${date[1]}-${date[2]}`;

    return date;
}