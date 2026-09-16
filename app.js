/* =====================================================
   我的點數 App
   app.js
===================================================== */


/* =====================================================
   1. 基本資料
===================================================== */

const STORAGE_KEY = "myRewardAppData";

let currentWeekOffset = 0;


const defaultData = {

    points: 0,

    goals: [
        {
            id: createId(),
            name: "地瓜球",
            points: 3
        },
        {
            id: createId(),
            name: "泡麵",
            points: 10
        }
    ],

    tasks: [
        {
            id: createId(),
            name: "讀書30分鐘"
        },
        {
            id: createId(),
            name: "洗衣服"
        },
        {
            id: createId(),
            name: "曬衣服"
        }
    ],

    records: []

};


/* =====================================================
   2. 載入資料
===================================================== */

let appData = loadData();


function loadData() {

    const savedData =
        localStorage.getItem(STORAGE_KEY);


    if (!savedData) {

        const newData =
            JSON.parse(
                JSON.stringify(defaultData)
            );


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(newData)
        );


        return newData;

    }


    try {

        const parsedData =
            JSON.parse(savedData);


        if (
            typeof parsedData.points !== "number"
        ) {

            parsedData.points = 0;

        }


        if (
            !Array.isArray(parsedData.goals)
        ) {

            parsedData.goals = [];

        }


        if (
            !Array.isArray(parsedData.tasks)
        ) {

            parsedData.tasks = [];

        }


        if (
            !Array.isArray(parsedData.records)
        ) {

            parsedData.records = [];

        }


        return parsedData;


    } catch (error) {

        console.error(
            "讀取資料失敗：",
            error
        );


        return JSON.parse(
            JSON.stringify(defaultData)
        );

    }

}


/* =====================================================
   3. 儲存資料
===================================================== */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );

}


/* =====================================================
   4. 建立唯一 ID
===================================================== */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


/* =====================================================
   5. 日期工具
===================================================== */

function getDateKey(
    date = new Date()
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return (
        `${year}-${month}-${day}`
    );

}


function getMonday(date) {

    const result =
        new Date(date);


    result.setHours(
        0,
        0,
        0,
        0
    );


    const day =
        result.getDay();


    const difference =
        day === 0
            ? -6
            : 1 - day;


    result.setDate(
        result.getDate() +
        difference
    );


    return result;

}


function addDays(
    date,
    amount
) {

    const result =
        new Date(date);


    result.setDate(
        result.getDate() +
        amount
    );


    return result;

}


function formatShortDate(date) {

    return (
        (date.getMonth() + 1) +
        "/" +
        date.getDate()
    );

}


/* =====================================================
   6. 四個頁面切換
===================================================== */

const pages =
    document.querySelectorAll(
        ".page"
    );


const navButtons =
    document.querySelectorAll(
        ".nav-button"
    );


navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                const pageName =
                    button.dataset.page;


                pages.forEach(
                    page => {

                        page.classList.remove(
                            "active"
                        );

                    }
                );


                navButtons.forEach(
                    nav => {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );


                const targetPage =
                    document.getElementById(
                        "page-" +
                        pageName
                    );


                if (targetPage) {

                    targetPage.classList.add(
                        "active"
                    );

                }


                button.classList.add(
                    "active"
                );


                if (
                    pageName ===
                    "record"
                ) {

                    renderWeeklyRecord();

                }

            }
        );

    }
);


/* =====================================================
   7. 顯示目前總點數
===================================================== */

function renderPoints() {

    const element =
        document.getElementById(
            "totalPoints"
        );


    element.textContent =
        appData.points;

}


/* =====================================================
   8. 第一頁：顯示獎勵
===================================================== */

function renderGoals() {

    const goalList =
        document.getElementById(
            "goalList"
        );


    goalList.innerHTML = "";


    const sortedGoals =
        [...appData.goals]
            .sort(
                (a, b) =>
                    a.points -
                    b.points
            );


    if (
        sortedGoals.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "record-empty";


        empty.textContent =
            "目前沒有可兌換的獎勵";


        goalList.appendChild(
            empty
        );


        return;

    }


    sortedGoals.forEach(
        goal => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "goal-item";


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "goal-name";


            name.textContent =
                goal.name;


            const right =
                document.createElement(
                    "div"
                );


            right.className =
                "goal-actions";


            const points =
                document.createElement(
                    "span"
                );


            points.className =
                "goal-points";


            points.textContent =
                goal.points +
                " 點";


            const redeemButton =
                document.createElement(
                    "button"
                );


            redeemButton.className =
                "redeem-button";


            redeemButton.textContent =
                "兌換";


            if (
                appData.points <
                goal.points
            ) {

                redeemButton.disabled =
                    true;

            }


            redeemButton.addEventListener(
                "click",
                function () {

                    redeemGoal(
                        goal.id
                    );

                }
            );


            right.appendChild(
                points
            );


            right.appendChild(
                redeemButton
            );


            item.appendChild(
                name
            );


            item.appendChild(
                right
            );


            goalList.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   9. 第二頁：顯示加分選項
===================================================== */

function renderTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );


    taskList.innerHTML = "";


    if (
        appData.tasks.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "record-empty";


        empty.textContent =
            "目前沒有加分選項";


        taskList.appendChild(
            empty
        );


        return;

    }


    appData.tasks.forEach(
        task => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "task-button";


            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                task.name;


            const points =
                document.createElement(
                    "span"
                );


            points.textContent =
                "+1";


            button.appendChild(
                name
            );


            button.appendChild(
                points
            );


            button.addEventListener(
                "click",
                function () {

                    addPoint(
                        task
                    );

                }
            );


            taskList.appendChild(
                button
            );

        }
    );

}


/* =====================================================
   10. 第三頁：顯示目前加分事項
===================================================== */

function renderManageTasks() {

    const manageTaskList =
        document.getElementById(
            "manageTaskList"
        );


    if (!manageTaskList) {

        return;

    }


    manageTaskList.innerHTML = "";


    if (
        appData.tasks.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "record-empty";


        empty.textContent =
            "目前沒有加分事項";


        manageTaskList.appendChild(
            empty
        );


        return;

    }


    appData.tasks.forEach(
        task => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "manage-task-item";


            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                task.name;


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "delete-task-button";


            deleteButton.textContent =
                "刪除";


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteTask(
                        task.id
                    );

                }
            );


            item.appendChild(
                name
            );


            item.appendChild(
                deleteButton
            );


            manageTaskList.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   11. 按一下加分
===================================================== */

function addPoint(task) {

    appData.points += 1;


    const record = {

        id:
            createId(),

        timestamp:
            new Date()
                .toISOString(),

        date:
            getDateKey(),

        type:
            "task",

        name:
            task.name,

        delta:
            1,

        undone:
            false

    };


    appData.records.push(
        record
    );


    saveData();

    renderAll();

}


/* =====================================================
   12. 今日五個進度燈
===================================================== */

function renderDailyProgress() {

    const today =
        getDateKey();


    const todayRecords =
        appData.records.filter(
            record => {

                return (

                    record.date ===
                        today &&

                    record.type ===
                        "task" &&

                    record.delta ===
                        1 &&

                    record.undone !==
                        true

                );

            }
        );


    const completed =
        Math.min(
            todayRecords.length,
            5
        );


    const lights =
        document.querySelectorAll(
            ".progress-light"
        );


    lights.forEach(
        (light, index) => {

            if (
                index <
                completed
            ) {

                light.classList.add(
                    "active"
                );

            } else {

                light.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =====================================================
   13. 取消上一筆
===================================================== */

const undoButton =
    document.getElementById(
        "undoButton"
    );


undoButton.addEventListener(
    "click",
    undoLastPoint
);


function undoLastPoint() {

    const today =
        getDateKey();


    const visibleTodayRecords =
        appData.records.filter(
            record => {

                return (

                    record.date ===
                        today &&

                    record.type !==
                        "undo" &&

                    record.undone !==
                        true

                );

            }
        );


    if (
        visibleTodayRecords.length ===
        0
    ) {

        alert(
            "今天沒有可以取消的上一筆紀錄。"
        );

        return;

    }


    const lastVisibleRecord =
        visibleTodayRecords[
            visibleTodayRecords.length -
            1
        ];


    /*
    最近一筆必須是加分紀錄，
    才允許取消。
    */

    if (
        lastVisibleRecord.type !==
            "task" ||

        lastVisibleRecord.delta !==
            1
    ) {

        alert(
            "最近一筆不是加分紀錄，無法取消。"
        );

        return;

    }


    const targetIndex =
        appData.records.findIndex(
            record =>
                record.id ===
                lastVisibleRecord.id
        );


    if (
        targetIndex === -1
    ) {

        alert(
            "找不到可以取消的紀錄。"
        );

        return;

    }


    /*
    直接刪除誤按的紀錄。
    不留下「取消上一筆 -1」。
    */

    appData.records.splice(
        targetIndex,
        1
    );


    appData.points =
        Math.max(
            0,
            appData.points - 1
        );


    saveData();

    renderAll();

}


/* =====================================================
   14. 第三頁：新增獎勵
===================================================== */

const goalNameInput =
    document.getElementById(
        "goalName"
    );


const goalPointsInput =
    document.getElementById(
        "goalPoints"
    );


const addGoalButton =
    document.getElementById(
        "addGoalButton"
    );


addGoalButton.addEventListener(
    "click",
    addGoal
);


function addGoal() {

    const name =
        goalNameInput
            .value
            .trim();


    const points =
        Number(
            goalPointsInput.value
        );


    if (!name) {

        alert(
            "請輸入獎勵名稱。"
        );

        return;

    }


    if (
        !Number.isFinite(
            points
        ) ||

        points <= 0
    ) {

        alert(
            "請輸入正確的所需點數。"
        );

        return;

    }


    appData.goals.push({

        id:
            createId(),

        name:
            name,

        points:
            Math.floor(
                points
            )

    });


    saveData();


    goalNameInput.value =
        "";


    goalPointsInput.value =
        "";


    renderAll();


    alert(
        "獎勵已新增。"
    );

}


/* =====================================================
   15. 第一頁：兌換獎勵
===================================================== */

function redeemGoal(
    goalId
) {

    const goal =
        appData.goals.find(
            goal =>
                goal.id ===
                goalId
        );


    if (!goal) {

        return;

    }


    if (
        appData.points <
        goal.points
    ) {

        alert(
            "目前點數不足。"
        );

        return;

    }


    const confirmed =
        confirm(
            `確定要使用 ${goal.points} 點兌換「${goal.name}」嗎？`
        );


    if (!confirmed) {

        return;

    }


    appData.points -=
        goal.points;


    appData.records.push({

        id:
            createId(),

        timestamp:
            new Date()
                .toISOString(),

        date:
            getDateKey(),

        type:
            "redeem",

        name:
            "兌換：" +
            goal.name,

        delta:
            -goal.points

    });


    /*
    兌換後獎勵消失。
    */

    appData.goals =
        appData.goals.filter(
            item =>
                item.id !==
                goalId
        );


    saveData();

    renderAll();

}


/* =====================================================
   16. 第三頁：新增加分事項
===================================================== */

const taskNameInput =
    document.getElementById(
        "taskName"
    );


const addTaskButton =
    document.getElementById(
        "addTaskButton"
    );


addTaskButton.addEventListener(
    "click",
    addTask
);


function addTask() {

    const name =
        taskNameInput
            .value
            .trim();


    if (!name) {

        alert(
            "請輸入事項名稱。"
        );

        return;

    }


    const alreadyExists =
        appData.tasks.some(
            task =>
                task.name ===
                name
        );


    if (
        alreadyExists
    ) {

        alert(
            "這個加分事項已經存在。"
        );

        return;

    }


    appData.tasks.push({

        id:
            createId(),

        name:
            name

    });


    saveData();


    taskNameInput.value =
        "";


    renderAll();


    alert(
        "加分事項已新增。"
    );

}


/* =====================================================
   17. 第三頁：刪除加分事項
===================================================== */

function deleteTask(
    taskId
) {

    const task =
        appData.tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task) {

        return;

    }


    const confirmed =
        confirm(
            `確定要刪除「${task.name}」嗎？\n\n以前的紀錄不會被刪除。`
        );


    if (!confirmed) {

        return;

    }


    /*
    只刪除未來可選擇的加分事項。

    過去完成過的紀錄仍然保留。
    */

    appData.tasks =
        appData.tasks.filter(
            item =>
                item.id !==
                taskId
        );


    saveData();

    renderAll();

}


/* =====================================================
   18. 第四頁：上一週 / 下一週
===================================================== */

const previousWeekButton =
    document.getElementById(
        "previousWeek"
    );


const nextWeekButton =
    document.getElementById(
        "nextWeek"
    );


previousWeekButton.addEventListener(
    "click",
    function () {

        currentWeekOffset -= 1;

        renderWeeklyRecord();

    }
);


nextWeekButton.addEventListener(
    "click",
    function () {

        currentWeekOffset += 1;

        renderWeeklyRecord();

    }
);


/* =====================================================
   19. 第四頁：產生每週紀錄
===================================================== */

function renderWeeklyRecord() {

    const weeklyRecord =
        document.getElementById(
            "weeklyRecord"
        );


    const weekRange =
        document.getElementById(
            "weekRange"
        );


    weeklyRecord.innerHTML =
        "";


    const today =
        new Date();


    let monday =
        getMonday(
            today
        );


    monday =
        addDays(
            monday,
            currentWeekOffset *
                7
        );


    const sunday =
        addDays(
            monday,
            6
        );


    weekRange.textContent =
        formatShortDate(
            monday
        ) +
        " ～ " +
        formatShortDate(
            sunday
        );


    const weekdayNames = [

        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
        "星期日"

    ];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const date =
            addDays(
                monday,
                i
            );


        const dateKey =
            getDateKey(
                date
            );


        const dayBlock =
            document.createElement(
                "div"
            );


        dayBlock.className =
            "record-day";


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "record-day-title";


        title.textContent =
            weekdayNames[i];


        dayBlock.appendChild(
            title
        );


        const records =
            appData.records.filter(
                record =>

                    record.date ===
                        dateKey &&

                    record.type !==
                        "undo" &&

                    record.undone !==
                        true

            );


        if (
            records.length ===
            0
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "record-empty";


            empty.textContent =
                "無紀錄";


            dayBlock.appendChild(
                empty
            );

        } else {

            records.forEach(
                record => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "record-item";


                    const name =
                        document.createElement(
                            "span"
                        );


                    name.textContent =
                        record.name;


                    const delta =
                        document.createElement(
                            "span"
                        );


                    if (
                        record.delta >
                        0
                    ) {

                        delta.textContent =
                            "+" +
                            record.delta;

                    } else {

                        delta.textContent =
                            record.delta;

                    }


                    item.appendChild(
                        name
                    );


                    item.appendChild(
                        delta
                    );


                    dayBlock.appendChild(
                        item
                    );

                }
            );

        }


        weeklyRecord.appendChild(
            dayBlock
        );

    }

}


/* =====================================================
   20. 第一頁：匯出紀錄
===================================================== */

const backupButton =
    document.getElementById(
        "backupButton"
    );


backupButton.addEventListener(
    "click",
    exportRecords
);


/* =====================================================
   21. 匯出 Excel 可開啟的 CSV
===================================================== */

function exportRecords() {

    const filteredRecords =
        appData.records.filter(
            record =>

                record.type !==
                    "undo" &&

                record.undone !==
                    true
        );


    if (
        filteredRecords.length ===
        0
    ) {

        alert(
            "目前還沒有任何可匯出的紀錄。"
        );

        return;

    }


    const weekdayNames = [

        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六"

    ];


    const rows = [

        [
            "日期",
            "星期",
            "紀錄",
            "點數"
        ]

    ];


    filteredRecords.forEach(
        record => {

            const date =
                new Date(
                    record.date +
                    "T00:00:00"
                );


            const weekday =
                weekdayNames[
                    date.getDay()
                ];


            const displayDate =
                record.date
                    .replaceAll(
                        "-",
                        "/"
                    );


            let displayPoints =
                record.delta;


            if (
                record.delta >
                0
            ) {

                displayPoints =
                    "+" +
                    record.delta;

            }


            rows.push([

                displayDate,

                weekday,

                record.name,

                displayPoints

            ]);

        }
    );


    const csvContent =
        rows
            .map(
                row =>

                    row
                        .map(
                            value => {

                                const text =
                                    String(
                                        value
                                    )
                                    .replaceAll(
                                        '"',
                                        '""'
                                    );


                                return (
                                    `"${text}"`
                                );

                            }
                        )
                        .join(",")

            )
            .join("\n");


    const blob =
        new Blob(

            [
                "\uFEFF" +
                csvContent
            ],

            {
                type:
                    "text/csv;charset=utf-8;"
            }

        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "點數紀錄_" +
        getDateKey() +
        ".csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =====================================================
   22. PWA Service Worker
===================================================== */

if (
    "serviceWorker" in
    navigator
) {

    window.addEventListener(
        "load",
        function () {

            navigator
                .serviceWorker
                .register(
                    "./service-worker.js"
                )
                .catch(
                    error => {

                        console.log(
                            "Service Worker 尚未啟用：",
                            error
                        );

                    }
                );

        }
    );

}


/* =====================================================
   23. 一次重新整理所有畫面
===================================================== */

function renderAll() {

    renderPoints();

    renderGoals();

    renderTasks();

    renderManageTasks();

    renderDailyProgress();

    renderWeeklyRecord();

}


/* =====================================================
   24. App 啟動
===================================================== */

renderAll();