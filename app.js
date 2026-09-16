/* =====================================================
   我的點數 App
   app.js
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

let appData = loadData();


/* =====================================================
   1. 資料讀取 / 儲存
===================================================== */

function loadData() {

    const savedData =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!savedData) {

        const newData =
            JSON.parse(
                JSON.stringify(
                    defaultData
                )
            );


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                newData
            )
        );


        return newData;
    }


    try {

        const parsedData =
            JSON.parse(
                savedData
            );


        if (
            typeof parsedData.points !==
            "number"
        ) {
            parsedData.points = 0;
        }


        if (
            !Array.isArray(
                parsedData.goals
            )
        ) {
            parsedData.goals = [];
        }


        if (
            !Array.isArray(
                parsedData.tasks
            )
        ) {
            parsedData.tasks = [];
        }


        if (
            !Array.isArray(
                parsedData.records
            )
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
            JSON.stringify(
                defaultData
            )
        );

    }

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            appData
        )
    );

}


/* =====================================================
   2. 共用工具
===================================================== */

function createId() {

    return (
        Date.now()
            .toString(36) +

        Math.random()
            .toString(36)
            .substring(2)
    );

}


function getDateKey(
    date = new Date()
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


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
        `${date.getMonth() + 1}/${date.getDate()}`
    );

}


/* =====================================================
   3. 四個頁面切換
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
   4. 第一頁：目前點數
===================================================== */

function renderPoints() {

    const element =
        document.getElementById(
            "totalPoints"
        );


    if (!element) {
        return;
    }


    element.textContent =
        appData.points;

}


/* =====================================================
   5. 第一頁：獎勵兌換處
===================================================== */

function renderGoals() {

    const goalList =
        document.getElementById(
            "goalList"
        );


    if (!goalList) {
        return;
    }


    goalList.innerHTML =
        "";


    const sortedGoals =
        [...appData.goals]
            .sort(
                (a, b) =>
                    a.points -
                    b.points
            );


    if (
        sortedGoals.length ===
        0
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
                `${goal.points} 點`;


            const redeemButton =
                document.createElement(
                    "button"
                );


            redeemButton.className =
                "redeem-button";


            redeemButton.textContent =
                "兌換";


            redeemButton.disabled =
                appData.points <
                goal.points;


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
   6. 第二頁：加分選項
===================================================== */

function renderTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );


    if (!taskList) {
        return;
    }


    taskList.innerHTML =
        "";


    if (
        appData.tasks.length ===
        0
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
   7. 第三頁：管理現有獎勵
   新版使用下拉式選單

   同時保留舊版 manageGoalList，
   所以你還沒換 index.html 時也不會壞掉。
===================================================== */

function renderManageGoals() {

    const select =
        document.getElementById(
            "goalDeleteSelect"
        );


    const deleteButton =
        document.getElementById(
            "deleteGoalButton"
        );


    /*
    新版下拉式選單
    */

    if (select) {

        const previousValue =
            select.value;


        select.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            appData.goals.length === 0
                ? "目前沒有獎勵"
                : "請選擇獎勵";


        select.appendChild(
            placeholder
        );


        const sortedGoals =
            [...appData.goals]
                .sort(
                    (a, b) =>
                        a.points -
                        b.points
                );


        sortedGoals.forEach(
            goal => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    goal.id;


                option.textContent =
                    `${goal.name} — ${goal.points} 點`;


                select.appendChild(
                    option
                );

            }
        );


        if (
            appData.goals.some(
                goal =>
                    goal.id ===
                    previousValue
            )
        ) {

            select.value =
                previousValue;

        }


        if (deleteButton) {

            deleteButton.disabled =
                !select.value;

        }

    }


    /*
    舊版 index.html 相容
    */

    const legacyList =
        document.getElementById(
            "manageGoalList"
        );


    if (legacyList) {

        legacyList.innerHTML =
            "";


        if (
            appData.goals.length ===
            0
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "record-empty";


            empty.textContent =
                "目前沒有獎勵";


            legacyList.appendChild(
                empty
            );


            return;

        }


        const sortedGoals =
            [...appData.goals]
                .sort(
                    (a, b) =>
                        a.points -
                        b.points
                );


        sortedGoals.forEach(
            goal => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "manage-goal-item";


                const name =
                    document.createElement(
                        "span"
                    );


                name.className =
                    "manage-goal-name";


                name.textContent =
                    goal.name;


                const right =
                    document.createElement(
                        "div"
                    );


                right.className =
                    "manage-goal-actions";


                const points =
                    document.createElement(
                        "span"
                    );


                points.className =
                    "manage-goal-points";


                points.textContent =
                    `${goal.points} 點`;


                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "delete-goal-button";


                button.textContent =
                    "刪除";


                button.addEventListener(
                    "click",
                    function () {

                        deleteGoal(
                            goal.id
                        );

                    }
                );


                right.appendChild(
                    points
                );


                right.appendChild(
                    button
                );


                item.appendChild(
                    name
                );


                item.appendChild(
                    right
                );


                legacyList.appendChild(
                    item
                );

            }
        );

    }

}


/* =====================================================
   8. 第三頁：管理現有加分事項
   新版使用下拉式選單

   同時保留舊版 manageTaskList 相容性
===================================================== */

function renderManageTasks() {

    const select =
        document.getElementById(
            "taskDeleteSelect"
        );


    const deleteButton =
        document.getElementById(
            "deleteTaskButton"
        );


    /*
    新版下拉式選單
    */

    if (select) {

        const previousValue =
            select.value;


        select.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            appData.tasks.length === 0
                ? "目前沒有加分事項"
                : "請選擇加分事項";


        select.appendChild(
            placeholder
        );


        appData.tasks.forEach(
            task => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    task.id;


                option.textContent =
                    task.name;


                select.appendChild(
                    option
                );

            }
        );


        if (
            appData.tasks.some(
                task =>
                    task.id ===
                    previousValue
            )
        ) {

            select.value =
                previousValue;

        }


        if (deleteButton) {

            deleteButton.disabled =
                !select.value;

        }

    }


    /*
    舊版 index.html 相容
    */

    const legacyList =
        document.getElementById(
            "manageTaskList"
        );


    if (legacyList) {

        legacyList.innerHTML =
            "";


        if (
            appData.tasks.length ===
            0
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "record-empty";


            empty.textContent =
                "目前沒有加分事項";


            legacyList.appendChild(
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


                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "delete-task-button";


                button.textContent =
                    "刪除";


                button.addEventListener(
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
                    button
                );


                legacyList.appendChild(
                    item
                );

            }
        );

    }

}


/* =====================================================
   9. 加分 +1
===================================================== */

function addPoint(task) {

    appData.points +=
        1;


    appData.records.push({

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

    });


    saveData();

    renderAll();

}


/* =====================================================
   10. 今日五個進度燈
===================================================== */

function renderDailyProgress() {

    const today =
        getDateKey();


    const completed =
        Math.min(

            appData.records.filter(
                record =>

                    record.date ===
                        today &&

                    record.type ===
                        "task" &&

                    record.delta ===
                        1 &&

                    record.undone !==
                        true
            ).length,

            5

        );


    const lights =
        document.querySelectorAll(
            ".progress-light"
        );


    lights.forEach(
        (light, index) => {

            light.classList.toggle(
                "active",
                index < completed
            );

        }
    );

}


/* =====================================================
   11. 取消上一筆加分

   直接刪除，
   不留下「取消上一筆 -1」紀錄。
===================================================== */

function undoLastPoint() {

    const today =
        getDateKey();


    const visibleTodayRecords =
        appData.records.filter(
            record =>

                record.date ===
                    today &&

                record.type !==
                    "undo" &&

                record.undone !==
                    true
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
    最近一筆必須是 +1 加分。
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
        targetIndex ===
        -1
    ) {

        alert(
            "找不到可以取消的紀錄。"
        );

        return;

    }


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


const undoButton =
    document.getElementById(
        "undoButton"
    );


if (undoButton) {

    undoButton.addEventListener(
        "click",
        undoLastPoint
    );

}


/* =====================================================
   12. 新增獎勵
===================================================== */

function addGoal() {

    const goalNameInput =
        document.getElementById(
            "goalName"
        );


    const goalPointsInput =
        document.getElementById(
            "goalPoints"
        );


    if (
        !goalNameInput ||
        !goalPointsInput
    ) {

        return;

    }


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


const addGoalButton =
    document.getElementById(
        "addGoalButton"
    );


if (addGoalButton) {

    addGoalButton.addEventListener(
        "click",
        addGoal
    );

}


/* =====================================================
   13. 刪除目前獎勵

   只刪除目前可兌換的獎勵。
   不扣點數。
   不刪除任何歷史紀錄。
===================================================== */

function deleteGoal(
    goalId
) {

    const goal =
        appData.goals.find(
            item =>
                item.id ===
                goalId
        );


    if (!goal) {
        return;
    }


    const confirmed =
        confirm(
            `確定要刪除「${goal.name}」嗎？\n\n過去紀錄不會受到影響。`
        );


    if (!confirmed) {
        return;
    }


    appData.goals =
        appData.goals.filter(
            item =>
                item.id !==
                goalId
        );


    saveData();

    renderAll();

}


/* 新版下拉式選單刪除 */

function deleteSelectedGoal() {

    const select =
        document.getElementById(
            "goalDeleteSelect"
        );


    if (
        !select ||
        !select.value
    ) {

        alert(
            "請先選擇要刪除的獎勵。"
        );

        return;

    }


    deleteGoal(
        select.value
    );

}


const goalDeleteSelect =
    document.getElementById(
        "goalDeleteSelect"
    );


const deleteGoalButton =
    document.getElementById(
        "deleteGoalButton"
    );


if (goalDeleteSelect) {

    goalDeleteSelect.addEventListener(
        "change",
        function () {

            if (deleteGoalButton) {

                deleteGoalButton.disabled =
                    !goalDeleteSelect.value;

            }

        }
    );

}


if (deleteGoalButton) {

    deleteGoalButton.addEventListener(
        "click",
        deleteSelectedGoal
    );

}


/* =====================================================
   14. 兌換獎勵
===================================================== */

function redeemGoal(
    goalId
) {

    const goal =
        appData.goals.find(
            item =>
                item.id ===
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
            -goal.points,

        goalId:
            goal.id,

        goalName:
            goal.name,

        goalPoints:
            goal.points

    });


    /*
    兌換後從目前獎勵清單移除。
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
   15. 撤銷兌換

   點數歸還
   獎勵恢復
   兌換紀錄消失
===================================================== */

function undoRedeem(
    recordId
) {

    const record =
        appData.records.find(
            item =>
                item.id ===
                recordId
        );


    if (
        !record ||
        record.type !==
            "redeem"
    ) {

        return;

    }


    /*
    相容舊版兌換紀錄。
    */

    const rewardName =

        record.goalName ||

        String(
            record.name ||
            ""
        ).replace(
            /^兌換：/,
            ""
        );


    const rewardPoints =

        Number(
            record.goalPoints
        ) ||

        Math.abs(
            Number(
                record.delta
            ) || 0
        );


    if (
        !rewardName ||
        rewardPoints <= 0
    ) {

        alert(
            "這筆舊紀錄資料不完整，無法撤銷。"
        );

        return;

    }


    const confirmed =
        confirm(
            `確定要撤銷「${rewardName}」的兌換嗎？\n\n${rewardPoints} 點會歸還。`
        );


    if (!confirmed) {
        return;
    }


    /*
    歸還點數。
    */

    appData.points +=
        rewardPoints;


    /*
    把原本的獎勵恢復。

    新版用 goalId 判斷。
    舊版才用名稱＋點數判斷。
    */

    const rewardAlreadyExists =

        record.goalId

            ? appData.goals.some(
                goal =>
                    goal.id ===
                    record.goalId
            )

            : appData.goals.some(
                goal =>

                    goal.name ===
                        rewardName &&

                    goal.points ===
                        rewardPoints
            );


    if (
        !rewardAlreadyExists
    ) {

        appData.goals.push({

            id:
                record.goalId ||
                createId(),

            name:
                rewardName,

            points:
                rewardPoints

        });

    }


    /*
    把兌換紀錄直接刪掉。
    */

    appData.records =
        appData.records.filter(
            item =>
                item.id !==
                recordId
        );


    saveData();

    renderAll();

}


/* =====================================================
   16. 新增加分事項
===================================================== */

function addTask() {

    const taskNameInput =
        document.getElementById(
            "taskName"
        );


    if (!taskNameInput) {
        return;
    }


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


    if (alreadyExists) {

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


const addTaskButton =
    document.getElementById(
        "addTaskButton"
    );


if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        addTask
    );

}


/* =====================================================
   17. 刪除目前加分事項

   只從未來可選的項目移除。
   過去已經獲得的 +1 紀錄完全保留。
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
            `確定要刪除「${task.name}」嗎？\n\n過去紀錄不會受到影響。`
        );


    if (!confirmed) {
        return;
    }


    appData.tasks =
        appData.tasks.filter(
            item =>
                item.id !==
                taskId
        );


    saveData();

    renderAll();

}


/* 新版下拉式選單刪除 */

function deleteSelectedTask() {

    const select =
        document.getElementById(
            "taskDeleteSelect"
        );


    if (
        !select ||
        !select.value
    ) {

        alert(
            "請先選擇要刪除的加分事項。"
        );

        return;

    }


    deleteTask(
        select.value
    );

}


const taskDeleteSelect =
    document.getElementById(
        "taskDeleteSelect"
    );


const deleteTaskButton =
    document.getElementById(
        "deleteTaskButton"
    );


if (taskDeleteSelect) {

    taskDeleteSelect.addEventListener(
        "change",
        function () {

            if (deleteTaskButton) {

                deleteTaskButton.disabled =
                    !taskDeleteSelect.value;

            }

        }
    );

}


if (deleteTaskButton) {

    deleteTaskButton.addEventListener(
        "click",
        deleteSelectedTask
    );

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


if (previousWeekButton) {

    previousWeekButton.addEventListener(
        "click",
        function () {

            currentWeekOffset -=
                1;


            renderWeeklyRecord();

        }
    );

}


if (nextWeekButton) {

    nextWeekButton.addEventListener(
        "click",
        function () {

            currentWeekOffset +=
                1;


            renderWeeklyRecord();

        }
    );

}


/* =====================================================
   19. 第四頁：每週紀錄
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


    if (
        !weeklyRecord ||
        !weekRange
    ) {

        return;

    }


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
        `${formatShortDate(monday)} ～ ${formatShortDate(sunday)}`;


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


        /*
        隱藏舊版 undo 紀錄，
        也隱藏舊版 undone=true 紀錄。
        */

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


                    delta.textContent =

                        record.delta > 0

                            ? `+${record.delta}`

                            : String(
                                record.delta
                            );


                    item.appendChild(
                        name
                    );


                    /*
                    兌換紀錄才顯示撤銷。
                    */

                    if (
                        record.type ===
                        "redeem"
                    ) {

                        const rightArea =
                            document.createElement(
                                "div"
                            );


                        rightArea.className =
                            "record-actions";


                        const undoRedeemButton =
                            document.createElement(
                                "button"
                            );


                        undoRedeemButton.className =
                            "undo-redeem-button";


                        undoRedeemButton.textContent =
                            "撤銷";


                        undoRedeemButton.addEventListener(
                            "click",
                            function () {

                                undoRedeem(
                                    record.id
                                );

                            }
                        );


                        rightArea.appendChild(
                            delta
                        );


                        rightArea.appendChild(
                            undoRedeemButton
                        );


                        item.appendChild(
                            rightArea
                        );

                    } else {

                        item.appendChild(
                            delta
                        );

                    }


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
   20. 匯出 Excel 可開啟的 CSV
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


            const displayPoints =

                record.delta > 0

                    ? `+${record.delta}`

                    : record.delta;


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
        `點數紀錄_${getDateKey()}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* 匯出按鈕 */

const backupButton =
    document.getElementById(
        "backupButton"
    );


if (backupButton) {

    backupButton.addEventListener(
        "click",
        exportRecords
    );

}


/* =====================================================
   21. PWA Service Worker
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
   22. 一次重新整理所有畫面
===================================================== */

function renderAll() {

    renderPoints();

    renderGoals();

    renderTasks();

    renderManageGoals();

    renderManageTasks();

    renderDailyProgress();

    renderWeeklyRecord();

}


/* =====================================================
   23. App 啟動
===================================================== */

renderAll();