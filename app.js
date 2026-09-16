/* =====================================================
   我的點數 App
   app.js
===================================================== */


/* =====================================================
   1. 基本資料
===================================================== */

const STORAGE_KEY = "myRewardAppData";

let currentWeekOffset = 0;


/*
第一次使用 App 時的預設資料。

之後如果你不想要預設的地瓜球、泡麵等等，
我們可以再拿掉。
*/

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

    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {

        const newData = JSON.parse(
            JSON.stringify(defaultData)
        );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(newData)
        );

        return newData;
    }


    try {

        const parsedData = JSON.parse(savedData);

        /*
        如果未來更新版本增加新的欄位，
        這裡可以避免舊資料造成錯誤。
        */

        if (typeof parsedData.points !== "number") {
            parsedData.points = 0;
        }

        if (!Array.isArray(parsedData.goals)) {
            parsedData.goals = [];
        }

        if (!Array.isArray(parsedData.tasks)) {
            parsedData.tasks = [];
        }

        if (!Array.isArray(parsedData.records)) {
            parsedData.records = [];
        }

        return parsedData;

    } catch (error) {

        console.error("讀取資料失敗：", error);

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
        Math.random().toString(36).substring(2)
    );

}


/* =====================================================
   5. 日期工具
===================================================== */


/*
取得 YYYY-MM-DD

這裡使用「手機當地時間」，
避免台灣時間因為 UTC 跑掉一天。
*/

function getDateKey(date = new Date()) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/*
取得某一天的星期一
*/

function getMonday(date) {

    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    const day = result.getDay();

    const difference =
        day === 0
            ? -6
            : 1 - day;

    result.setDate(
        result.getDate() + difference
    );

    return result;

}


/*
複製日期並增加天數
*/

function addDays(date, amount) {

    const result = new Date(date);

    result.setDate(
        result.getDate() + amount
    );

    return result;

}


/*
顯示 9/14 之類的日期
*/

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

const pages = document.querySelectorAll(".page");

const navButtons =
    document.querySelectorAll(".nav-button");


navButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            const pageName =
                button.dataset.page;


            /*
            先全部隱藏
            */

            pages.forEach(page => {
                page.classList.remove("active");
            });


            navButtons.forEach(nav => {
                nav.classList.remove("active");
            });


            /*
            顯示指定頁面
            */

            const targetPage =
                document.getElementById(
                    "page-" + pageName
                );

            if (targetPage) {

                targetPage.classList.add(
                    "active"
                );

            }

            button.classList.add(
                "active"
            );


            /*
            如果進入紀錄頁，
            重新整理紀錄。
            */

            if (pageName === "record") {

                renderWeeklyRecord();

            }

        }
    );

});


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
   8. 第一頁：顯示目標
===================================================== */

function renderGoals() {

    const goalList =
        document.getElementById(
            "goalList"
        );

    goalList.innerHTML = "";


    /*
    點數由低到高排列
    */

    const sortedGoals =
        [...appData.goals].sort(
            (a, b) =>
                a.points - b.points
        );


    if (sortedGoals.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "record-empty";

        empty.textContent =
            "目前沒有目標";

        goalList.appendChild(empty);

        return;
    }


    sortedGoals.forEach(goal => {

        const item =
            document.createElement("div");

        item.className =
            "goal-item";


        const name =
            document.createElement("span");

        name.className =
            "goal-name";

        name.textContent =
            goal.name;


        const points =
            document.createElement("span");

        points.className =
            "goal-points";

        points.textContent =
            goal.points + " 點";


        item.appendChild(name);

        item.appendChild(points);

        goalList.appendChild(item);

    });

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


    if (appData.tasks.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "record-empty";

        empty.textContent =
            "目前沒有加分選項";

        taskList.appendChild(empty);

        return;
    }


    appData.tasks.forEach(task => {

        const button =
            document.createElement("button");

        button.className =
            "task-button";


        const name =
            document.createElement("span");

        name.textContent =
            task.name;


        const points =
            document.createElement("span");

        points.textContent =
            "+1";


        button.appendChild(name);

        button.appendChild(points);


        button.addEventListener(
            "click",
            function () {

                addPoint(task);

            }
        );


        taskList.appendChild(button);

    });

}


/* =====================================================
   10. 按一下加分
===================================================== */

function addPoint(task) {

    /*
    總點數 +1
    */

    appData.points += 1;


    /*
    留下一筆紀錄
    */

    const record = {

        id: createId(),

        timestamp:
            new Date().toISOString(),

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


    appData.records.push(record);


    saveData();

    renderAll();

}


/* =====================================================
   11. 今日五個進度燈
===================================================== */

function renderDailyProgress() {

    const today =
        getDateKey();


    /*
    找今天所有有效的 +1 紀錄
    */

    const todayRecords =
        appData.records.filter(record => {

            return (
                record.date === today &&
                record.type === "task" &&
                record.delta === 1 &&
                record.undone !== true
            );

        });


    /*
    最多亮五顆
    */

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

            if (index < completed) {

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
   12. 取消上一筆
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

    /*
    從最後面開始找
    最近一筆沒有取消過的 +1
    */

    let targetRecord = null;


    for (
        let i =
            appData.records.length - 1;

        i >= 0;

        i--
    ) {

        const record =
            appData.records[i];


        if (
            record.type === "task" &&
            record.delta === 1 &&
            record.undone !== true
        ) {

            targetRecord = record;

            break;

        }

    }


    /*
    沒有可以取消的紀錄
    */

    if (!targetRecord) {

        alert(
            "目前沒有可以取消的上一筆紀錄。"
        );

        return;

    }


    /*
    原紀錄標記為已取消
    */

    targetRecord.undone = true;


    /*
    點數 -1

    避免意外變成負數
    */

    appData.points =
        Math.max(
            0,
            appData.points - 1
        );


    /*
    留下一筆「取消上一筆 -1」
    */

    appData.records.push({

        id: createId(),

        timestamp:
            new Date().toISOString(),

        date:
            getDateKey(),

        type:
            "undo",

        name:
            "取消上一筆",

        delta:
            -1,

        targetId:
            targetRecord.id

    });


    saveData();

    renderAll();

}


/* =====================================================
   13. 第三頁：新增目標
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
        goalNameInput.value.trim();

    const points =
        Number(
            goalPointsInput.value
        );


    if (!name) {

        alert(
            "請輸入目標名稱。"
        );

        return;

    }


    if (
        !Number.isFinite(points) ||
        points <= 0
    ) {

        alert(
            "請輸入正確的所需點數。"
        );

        return;

    }


    appData.goals.push({

        id: createId(),

        name: name,

        points:
            Math.floor(points)

    });


    saveData();


    /*
    清空輸入欄位
    */

    goalNameInput.value = "";

    goalPointsInput.value = "";


    renderGoals();


    alert(
        "目標已新增。"
    );

}


/* =====================================================
   14. 第三頁：新增加分事項
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
        taskNameInput.value.trim();


    if (!name) {

        alert(
            "請輸入事項名稱。"
        );

        return;

    }


    /*
    避免同名重複
    */

    const alreadyExists =
        appData.tasks.some(
            task =>
                task.name === name
        );


    if (alreadyExists) {

        alert(
            "這個加分事項已經存在。"
        );

        return;

    }


    appData.tasks.push({

        id: createId(),

        name: name

    });


    saveData();


    taskNameInput.value = "";


    renderTasks();


    alert(
        "加分事項已新增。"
    );

}


/* =====================================================
   15. 第四頁：上一週 / 下一週
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
   16. 第四頁：產生每週紀錄
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


    weeklyRecord.innerHTML = "";


    /*
    找目前這一週的星期一
    */

    const today =
        new Date();

    let monday =
        getMonday(today);


    /*
    根據上一週 / 下一週偏移
    */

    monday =
        addDays(
            monday,
            currentWeekOffset * 7
        );


    const sunday =
        addDays(
            monday,
            6
        );


    /*
    顯示日期範圍
    */

    weekRange.textContent =
        formatShortDate(monday) +
        " ～ " +
        formatShortDate(sunday);


    const weekdayNames = [
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
        "星期日"
    ];


    /*
    一天一天產生
    */

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
            getDateKey(date);


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


        dayBlock.appendChild(title);


        /*
        找這一天的所有紀錄
        */

        const records =
            appData.records.filter(
                record =>
                    record.date ===
                    dateKey
            );


        if (records.length === 0) {

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

            records.forEach(record => {

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


                if (record.delta > 0) {

                    delta.textContent =
                        "+" +
                        record.delta;

                } else {

                    delta.textContent =
                        record.delta;

                }


                item.appendChild(name);

                item.appendChild(delta);

                dayBlock.appendChild(
                    item
                );

            });

        }


        weeklyRecord.appendChild(
            dayBlock
        );

    }

}


/* =====================================================
   17. 第一頁：資料備份
===================================================== */

const backupButton =
    document.getElementById(
        "backupButton"
    );


backupButton.addEventListener(
    "click",
    backupMenu
);


function backupMenu() {

    /*
    第一個問題：

    確定 = 匯出
    取消 = 問是否要匯入
    */

    const exportBackup =
        confirm(
            "資料備份\n\n按「確定」匯出備份。\n按「取消」可以選擇是否匯入備份。"
        );


    if (exportBackup) {

        exportData();

        return;

    }


    const importBackup =
        confirm(
            "要從之前的備份檔案匯入資料嗎？"
        );


    if (importBackup) {

        importData();

    }

}


/* =====================================================
   18. 匯出備份
===================================================== */

function exportData() {

    const backup = {

        version: 1,

        exportDate:
            new Date().toISOString(),

        data:
            appData

    };


    const json =
        JSON.stringify(
            backup,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "點數備份_" +
        getDateKey() +
        ".json";


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);

}


/* =====================================================
   19. 匯入備份
===================================================== */

function importData() {

    const input =
        document.createElement(
            "input"
        );


    input.type = "file";

    input.accept =
        ".json,application/json";


    input.addEventListener(
        "change",
        function () {

            const file =
                input.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    try {

                        const backup =
                            JSON.parse(
                                event.target.result
                            );


                        if (
                            !backup ||
                            !backup.data
                        ) {

                            throw new Error(
                                "格式錯誤"
                            );

                        }


                        const confirmImport =
                            confirm(
                                "匯入備份會覆蓋目前的資料。\n\n確定要繼續嗎？"
                            );


                        if (
                            !confirmImport
                        ) {

                            return;

                        }


                        appData =
                            backup.data;


                        saveData();

                        renderAll();


                        alert(
                            "備份已成功匯入。"
                        );

                    } catch (error) {

                        alert(
                            "這個檔案不是有效的備份檔案。"
                        );

                    }

                };


            reader.readAsText(file);

        }
    );


    input.click();

}


/* =====================================================
   20. PWA Service Worker
===================================================== */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .catch(error => {

                    console.log(
                        "Service Worker 尚未啟用：",
                        error
                    );

                });

        }
    );

}


/* =====================================================
   21. 一次重新整理所有畫面
===================================================== */

function renderAll() {

    renderPoints();

    renderGoals();

    renderTasks();

    renderDailyProgress();

    renderWeeklyRecord();

}


/* =====================================================
   22. App 啟動
===================================================== */

renderAll();