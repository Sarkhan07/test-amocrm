const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjVjNTYwYTE4YzZhZjk0ZDJhNDg4ZjY5ZDhmMGJiZjA2MTA3MTg5NDE1NDQ1OWZjNzhiZTY3NzZkZjgwNjExY2I5MjJhMDhlYzczY2Y3ZGI4In0.eyJhdWQiOiJkOGRiZjY5Yy02NWY4LTQ4MWEtOGNjNi1lNzg3ZjRiY2Q0YWIiLCJqdGkiOiI1YzU2MGExOGM2YWY5NGQyYTQ4OGY2OWQ4ZjBiYmYwNjEwNzE4OTQxNTQ0NTlmYzc4YmU2Nzc2ZGY4MDYxMWNiOTIyYTA4ZWM3M2NmN2RiOCIsImlhdCI6MTcyNjY4MzgyOSwibmJmIjoxNzI2NjgzODI5LCJleHAiOjE3MzI5MjQ4MDAsInN1YiI6IjExNDg0MTE0IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTM1MTcwLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiZDIxYWJiYjgtYzNlNC00ZDgzLWEzNTctY2YxZmM0NDM4ZjY1IiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.VOOqC7MLzuC6XFM5zF-Ziou_ocb75QuNjKgUZstngP3bvt6oQYRBtVclcvvHfDFeA7sj3PuKNqrUNf4nVSwBLi0452bn30c9vFVcPgg-4Q-QGf9VGRbJGxfHaas9nYEwSPvzcscoAoz-E9oy3BgeRHuoVLNq0eWHBVeFqSluiWKsSuVtxFQaWHKzeRXi-J8XitZTps2l2ZLUqoXCwy_qFYH9FYgTtuqFwkxCXXUSh6Di9gsb4O_hNwVJ1yz4Eg_8Qo-o0PkUD-tE6ro8esEioTBFn4GkaRYDZdAVTLs1Myk5UQMdGpmIkFsfavCoOkowsEgsG71Tc-Bu87WPhAiPjA';
const apiUrl = 'https://abdullayevsarxan92.amocrm.ru/api/v4/leads';

$(document).ready(function() {

  let currentOffset = 0;
  const limit = 3; 

  function loadDeals() {
    $.ajax({
      url: apiUrl,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      data: {
        limit: limit,
        page: currentOffset
      },
      success: function (response) {
        let deals = response._embedded.leads;
        renderDeals(deals);
      },
      error: function (error) {
        console.error('Ошибка при получении сделок:', error);
      }
    });
  }

  loadDeals();


  function renderDeals(deals) {
    const tableBody = $('#dealsTable tbody');
    tableBody.empty(); 

    deals.forEach(deal => {
      const dealRow = `
        <tr data-deal-id="${deal.id}">
          <td>${deal.name}</td>
          <td>${deal.price}</td>
          <td>${deal.id}</td>
        </tr>`;
      tableBody.append(dealRow);
    });
  }

  
  $(document).on('click', 'tr[data-deal-id]', function () {
    const dealId = $(this).data('deal-id');
    const row = $(this);

    $('#dealsTable tr.expanded').removeClass('expanded').find('.details').remove();

   
    row.addClass('expanded').append('<td colspan="3" class="details">Загрузка...</td>');

   
    $.ajax({
      url: `${apiUrl}/${dealId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      success: function (deal) {
        row.find('.details').remove(); 
        displayDealDetails(row, deal); 
      },
      error: function (error) {
        console.error('Ошибка при получении деталей сделки:', error);
      }
    });
  });


  function displayDealDetails(row, deal) {
    const taskStatusColor = getTaskStatusColor(deal.closest_task_at);
    const dealDetails = `
      <td colspan="3" class="details">
        Название: ${deal.name}<br>
        ID: ${deal.id}<br>
        Дата: ${formatDate(deal.created_at)}<br>
        Статус задачи: <svg width="10" height="10">
                        <circle cx="5" cy="5" r="5" fill="${taskStatusColor}"/>
                      </svg>
      </td>`;
    row.append(dealDetails);
  }

  
  function getTaskStatusColor(taskDate) {
    if (!taskDate) {
      return 'red'; 
    }

    const currentDate = new Date();
    const taskDateObj = new Date(taskDate * 1000);
    const diffInDays = (taskDateObj - currentDate) / (1000 * 60 * 60 * 24);

    if (diffInDays < 0) {
      return 'red'; 
    } else if (diffInDays <= 1) {
      return 'green'; 
    } else {
      return 'yellow'; 
    }
  }


  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
});