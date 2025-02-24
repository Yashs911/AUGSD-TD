(function() {
  var datePicker = new mdDateTimePicker.default({
    type: "date",
    past: moment(),
    future: moment().add(6, "months")
  });

  var datePickerEnd = new mdDateTimePicker.default({
    type: "date",
    past: moment(),
    future: moment().add(6, "months")
  });

  var startTimePicker = new mdDateTimePicker.default({
    type: "time"
  });

  var endTimePicker = new mdDateTimePicker.default({
    type: "time"
  });

  document.getElementById("date").addEventListener("focus", function() {
    document.getElementById("date").blur();
    document.getElementById("dateBtn").click();
  });

  document.getElementById("date-end").addEventListener("focus", function() {
    document.getElementById("date-end").blur();
    document.getElementById("dateBtnEnd").click();
  });

  document.getElementById("time-start").addEventListener("focus", function() {
    document.getElementById("time-start").blur();
    document.getElementById("startBtn").click();
  });

  document.getElementById("time-end").addEventListener("focus", function() {
    document.getElementById("time-end").blur();
    document.getElementById("endBtn").click();
  });

  document.getElementById("dateBtn").addEventListener("click", function() {
    datePicker.toggle();
    document.getElementById("resDiv").innerHTML = "";
    document.getElementById("time-end").value = "";
    document.getElementById("time-end").parentNode.classList.remove("is-dirty");
    document.getElementById("time-start").value = "";
    document
      .getElementById("time-start")
      .parentNode.classList.remove("is-dirty");
  });

  document.getElementById("dateBtnEnd").addEventListener("click", function() {
    datePickerEnd.toggle();
    document.getElementById("resDiv").innerHTML = "";
    document.getElementById("time-end").value = "";
    document.getElementById("time-end").parentNode.classList.remove("is-dirty");
    document.getElementById("time-start").value = "";
    document
      .getElementById("time-start")
      .parentNode.classList.remove("is-dirty");
  });

  document.getElementById("startBtn").addEventListener("click", function() {
    startTimePicker.time = moment()
      .endOf("hour")
      .add(1, "minute");
    document.getElementById("resDiv").innerHTML = "";

    var selectedDate = parseInt(datePicker.time.get("date").toString());
    var selectedMonth = parseInt(datePicker.time.get("month").toString());
    var todayDate = parseInt(
      moment()
        .get("date")
        .toString()
    );
    var todayMonth = parseInt(
      moment()
        .get("month")
        .toString()
    );
    var hours = document.getElementById("mddtp-time__hourView").childNodes;

    var i = 1;
    startTimePicker.toggle();

    for (i = 1; i <= 24; i++) {
      hours[i - 1].style.visibility = "visible";
    }

    if (selectedDate == todayDate && selectedMonth == todayMonth) {
      var nowHour = parseInt(
        moment()
          .get("hour")
          .toString()
      );
      for (i = 1; i <= nowHour; i++) {
        // hours[i - 1].style.visibility = "hidden";
      }
    }

    document.getElementById("time-end").value = "";
    document.getElementById("time-end").parentNode.classList.remove("is-dirty");
  });

  document.getElementById("endBtn").addEventListener("click", function() {
    document.getElementById("resDiv").innerHTML = "";
    endTimePicker.time = startTimePicker.time;
    var hours = document.getElementById("mddtp-time__hourView").childNodes;
    endTimePicker.toggle();
    var startHour = parseInt(startTimePicker.time.get("hour").toString());
    var i = 1;
    for (i = 1; i <= startHour - 1; i++) {
      // hours[i - 1].style.visibility = "hidden";
    }
  });

  datePicker.trigger = document.getElementById("date");
  datePickerEnd.trigger = document.getElementById("date-end");
  startTimePicker.trigger = document.getElementById("time-start");
  endTimePicker.trigger = document.getElementById("time-end");

  document.getElementById("date").addEventListener("onOk", function() {
    this.value = moment(datePicker.time).format("ddd DD MMM YYYY");
    this.parentNode.classList.add("is-dirty");
  });

  document.getElementById("date-end").addEventListener("onOk", function() {
    this.value = moment(datePickerEnd.time).format("ddd DD MMM YYYY");
    this.parentNode.classList.add("is-dirty");
  });

  document.getElementById("time-start").addEventListener("onOk", function() {
    this.value = moment(startTimePicker.time).format("HH:mm");
    this.parentNode.classList.add("is-dirty");
  });

  document.getElementById("time-end").addEventListener("onOk", function() {
    this.value = moment(endTimePicker.time).format("HH:mm");
    this.parentNode.classList.add("is-dirty");
  });

  function enumerateDaysBetweenDates(startDate, endDate) {
    let dates = []
    while (moment(startDate) <= moment(endDate)) {
      dates.push(startDate);
      startDate = moment(startDate).add(1, 'days').format("ddd DD MMM YYYY");
    }
    if (dates.length) {
      return dates;
    } else {
      return [null];
    }
  }

  document.getElementById("findBtn").addEventListener("click", async function() {
    let startDate = document.getElementById("date").value;
    let endDate = document.getElementById("date-end").value ? document.getElementById("date-end").value : document.getElementById("date").value;
    const dates = enumerateDaysBetweenDates(startDate, endDate);
    document.getElementById("resDiv").innerHTML =
      "<br><div class='loadingSign'></div><br>";
    try {
      const responses = await Promise.all(
        dates
          .map(async (date) => (await axios
            .post("./fetch-list/" + +new Date(), {
              date: date,
              dates: dates,
              "time-start": document.getElementById("time-start").value,
              "time-end": document.getElementById("time-end").value,
              purpose: document.getElementById("purpose").value,
              phone: document.getElementById("phone").value,
              av: document.getElementById("av").value
            })).data)
      )

      if (responses.length) {
        document.getElementById("resDiv").innerHTML = responses[0];
        let startTime = document.getElementById("time-start").value;
        let endTime = document.getElementById("time-end").value;
        const dateTimeString = `${dates.join(', ')} : ${startTime} - ${endTime}`;
        document.getElementById("resDiv").querySelector("b").textContent = dateTimeString;
      }

      let innerHTMLContainer = document.createElement("div");
      responses.map((res) => {
        innerHTMLContainer.innerHTML += res;
      })

      let maxFrequency = responses?.length;

      var listItemsRepeat = Array.prototype.slice.call(
        innerHTMLContainer.getElementsByClassName("room-list-item")
      );

      const frequency = {};
      const listItems = [];

      for (const element of listItemsRepeat) {
        const id = element.getAttribute("id");
        if (!frequency[id]) {
          frequency[id] = 0;
        }
        frequency[id] += 1;
        if (frequency[id] === maxFrequency) {
          listItems.push(element);
        }
      }

      if (listItems.length == 0) {
        document.getElementById("resDiv").innerHTML = `<br><p>The following error occoured while processing your request</p><p><b>All the rooms for the selected date-time have been blocked by the administrator. Please contact Timetable Office for further assistance.</b></p><br>`
      } else {
        document.querySelector("#room-list-form ul.mdl-list").innerHTML = "";

        listItems.forEach(function (item) {
          document.querySelector("#room-list-form ul.mdl-list").appendChild(item);
          item.addEventListener('click', () => {
            let state = document.getElementById("room-" + item.id).checked;
            document.getElementById("room-" + item.id).checked = !state;
          })
        });

        document
          .getElementById("bookBtn")
          .addEventListener("click", function () {
            let checkboxes = document.getElementsByClassName("room-checkbox");
            let rooms = [];
            let i = 0;

            for (i = 0; i < checkboxes.length; i++) {
              if (checkboxes[i].checked) rooms.push(checkboxes[i].name);
            }

            axios.post("./submit", { rooms }).then(function (res) {
              if (res.data.booked == 1) {
                materialAlert(
                  "Success",
                  "Your booking request has been placed. Please check your email for further details.",
                  function (result) {
                    window.location.replace("./view");
                  }
                );
              } else if (res.data.partialBooking == 1) {
                materialAlert(
                  "Error",
                  "The following rooms were booked by someone else while you were doing the booking. Please select some other rooms to continue or click the find button again to refresh this list. <br><br>" +
                  res.data.notAvailable.toString(),
                  function (result) { }
                );
              } else if (res.data.noWorkingHours == 1) {
                materialAlert(
                  "Error",
                  "There are no working office-hours to process your booking.",
                  function (result) { }
                );
              } else if (res.data.allBlocked == 1) {
                materialAlert(
                  "Error",
                  "All rooms for the selected date/time are blocked.",
                  function (result) { }
                );
              }
            });
          });
      }

    } catch (err) {
      console.log(err)
      document.getElementById("resDiv").innerHTML = err?.response?.data || err;
    };
  });
}.call(this));
