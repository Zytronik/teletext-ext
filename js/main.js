document.onload = function () {
    const listElement = document.querySelector('#testList');

    browser.storage.sync.get(['data'])
        .then((result) => {
            if (result.data && result.data.length) {
                result.data.forEach((data_row) => {
                    appendItem(data_row.content, data_row.time);
                });
            } else {
                appendItem('No data are available');
            }
        });

    function appendItem(content, badgeContent = null) {
        listElement.append(`
      <li class="">
        ${content}
        ${badgeContent ? `<span class="">${badgeContent}</span>` : ''}
      </li>
    `);
    }

};