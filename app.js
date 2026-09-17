/* =====================================================
   我的點數 App
   app.js
===================================================== */

const STORAGE_KEY = "myRewardAppData";

let currentWeekOffset = 0;
let currentManageSection = null;

const defaultData = {
    points: 0,

    goals: [
        { id: createId(), name: "地瓜球", points: 3 },
        { id: createId(), name: "泡麵", points: 10 }
    ],

    tasks: [
        { id: createId(), name: "讀書30分鐘" },
        { id: createId(), name: "洗衣服" },
        { id: createId(), name: "曬衣服" }
    ],

    shortTasks: [],

    records: []
};

let appData = loadData();


/* =====================================================
   資料
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
                parsedData.shortTasks
            )
        ) {
            parsedData.shortTasks = [];
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


function createId() {

    return (
        Date.now()
            .toString(36) +

        Math.random()
            .toString(36)
            .substring(2)
    );
}


/* =====================================================
   日期工具
===================================================== */

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


function getMonday(
    date
) {

    const result =
        new Date(
            date
        );


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
        new Date(
            date
        );


    result.setDate(
        result.getDate() +
        amount
    );


    return result;
}


function formatShortDate(
    date
) {

    return (
        `${date.getMonth() + 1}/${date.getDate()}`
    );
}


function formatDateKeyShort(
    dateKey
) {

    const parts =
        String(
            dateKey
        ).split("-");


    if (
        parts.length !==
        3
    ) {

        return dateKey;
    }


    return (
        `${Number(parts[1])}/${Number(parts[2])}`
    );
}


function cleanupExpiredShortTasks() {

    const today =
        getDateKey();


    const originalLength =
        appData.shortTasks.length;


    appData.shortTasks =
        appData.shortTasks.filter(
            task =>
                task.date >=
                today
        );


    if (
        appData.shortTasks.length !==
        originalLength
    ) {

        saveData();
    }
}


/* =====================================================
   底部四頁切換
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
   管理頁：極簡摺疊選單

   預設全部收起。
   點同一區：收起。
   點另一區：原本收起，新區展開。
===================================================== */

const manageAccordionSections = {

    goal: {
        toggleId:
            "manageGoalToggle",

        contentId:
            "manageGoalContent"
    },


    task: {
        toggleId:
            "manageTaskToggle",

        contentId:
            "manageTaskContent"
    },


    shortTask: {
        toggleId:
            "manageShortTaskToggle",

        contentId:
            "manageShortTaskContent"
    }
};


function renderManageAccordion() {

    Object.entries(
        manageAccordionSections
    ).forEach(

        (
            [
                sectionName,
                section
            ]
        ) => {

            const toggle =
                document.getElementById(
                    section.toggleId
                );


            const content =
                document.getElementById(
                    section.contentId
                );


            if (
                !toggle ||
                !content
            ) {

                return;
            }


            const isOpen =
                currentManageSection ===
                sectionName;


            content.hidden =
                !isOpen;


            toggle.setAttribute(
                "aria-expanded",
                String(
                    isOpen
                )
            );


            toggle.classList.toggle(
                "active",
                isOpen
            );
        }
    );
}


function toggleManageSection(
    sectionName
) {

    if (
        !manageAccordionSections[
            sectionName
        ]
    ) {

        return;
    }


    currentManageSection =

        currentManageSection ===
        sectionName

            ? null

            : sectionName;


    renderManageAccordion();
}


function setupManageAccordion() {

    Object.entries(
        manageAccordionSections
    ).forEach(

        (
            [
                sectionName,
                section
            ]
        ) => {

            const toggle =
                document.getElementById(
                    section.toggleId
                );


            if (!toggle) {

                return;
            }


            toggle.addEventListener(
                "click",
                function () {

                    toggleManageSection(
                        sectionName
                    );
                }
            );
        }
    );


    renderManageAccordion();
}


/* =====================================================
   第一頁：目前點數
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
   第一頁：今日功績
===================================================== */

function renderAchievements() {

    const display =
        document.getElementById(
            "achievementDisplay"
        );


    const list =
        document.getElementById(
            "achievementList"
        );


    const openButton =
        document.getElementById(
            "openAchievementFormButton"
        );


    if (
        !display ||
        !list ||
        !openButton
    ) {

        return;
    }


    const today =
        getDateKey();


    const achievements =
        appData.records.filter(
            record =>

                record.date ===
                    today &&

                record.type ===
                    "achievement" &&

                record.delta ===
                    1 &&

                record.undone !==
                    true
        );


    list.innerHTML =
        "";


    if (
        achievements.length ===
        0
    ) {

        display.hidden =
            true;


        openButton.textContent =
            "＋ 新增今日功績";


        return;
    }


    display.hidden =
        false;


    openButton.textContent =
        "＋ 再新增一件";


    achievements.forEach(
        record => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "achievement-item";


            item.textContent =
                record.name;


            list.appendChild(
                item
            );
        }
    );
}


function openAchievementForm() {

    const form =
        document.getElementById(
            "achievementForm"
        );


    const input =
        document.getElementById(
            "achievementInput"
        );


    const openButton =
        document.getElementById(
            "openAchievementFormButton"
        );


    if (
        !form ||
        !input
    ) {

        return;
    }


    form.hidden =
        false;


    if (
        openButton
    ) {

        openButton.hidden =
            true;
    }


    input.focus();
}


function closeAchievementForm() {

    const form =
        document.getElementById(
            "achievementForm"
        );


    const input =
        document.getElementById(
            "achievementInput"
        );


    const openButton =
        document.getElementById(
            "openAchievementFormButton"
        );


    if (form) {

        form.hidden =
            true;
    }


    if (input) {

        input.value =
            "";
    }


    if (openButton) {

        openButton.hidden =
            false;
    }
}


function addAchievement() {

    const input =
        document.getElementById(
            "achievementInput"
        );


    if (!input) {

        return;
    }


    const name =
        input
            .value
            .trim();


    if (!name) {

        alert(
            "請輸入今天做到的事。"
        );


        return;
    }


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
            "achievement",

        name:
            name,

        delta:
            1,

        undone:
            false
    });


    saveData();

    closeAchievementForm();

    renderAll();
}


const openAchievementFormButton =
    document.getElementById(
        "openAchievementFormButton"
    );


const cancelAchievementButton =
    document.getElementById(
        "cancelAchievementButton"
    );


const addAchievementButton =
    document.getElementById(
        "addAchievementButton"
    );


const achievementInput =
    document.getElementById(
        "achievementInput"
    );


if (
    openAchievementFormButton
) {

    openAchievementFormButton
        .addEventListener(
            "click",
            openAchievementForm
        );
}


if (
    cancelAchievementButton
) {

    cancelAchievementButton
        .addEventListener(
            "click",
            closeAchievementForm
        );
}


if (
    addAchievementButton
) {

    addAchievementButton
        .addEventListener(
            "click",
            addAchievement
        );
}


if (
    achievementInput
) {

    achievementInput
        .addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    addAchievement();
                }
            }
        );
}


/* =====================================================
   第一頁：獎勵兌換處
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
        [
            ...appData.goals
        ].sort(
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


            redeemButton
                .addEventListener(
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
   第二頁：固定加分選項
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
   第二頁：短期任務
===================================================== */

function renderShortTasks() {

    const section =
        document.getElementById(
            "shortTaskSection"
        );


    const list =
        document.getElementById(
            "shortTaskList"
        );


    if (
        !section ||
        !list
    ) {

        return;
    }


    const today =
        getDateKey();


    const todayTasks =
        appData.shortTasks.filter(
            task =>
                task.date ===
                today
        );


    list.innerHTML =
        "";


    if (
        todayTasks.length ===
        0
    ) {

        section.hidden =
            true;


        return;
    }


    section.hidden =
        false;


    todayTasks.forEach(
        task => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "task-button short-task-button";


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

                    completeShortTask(
                        task.id
                    );
                }
            );


            list.appendChild(
                button
            );
        }
    );
}


/* =====================================================
   +1 與今日進度
===================================================== */

function addPoint(
    task
) {

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


function completeShortTask(
    taskId
) {

    const task =
        appData.shortTasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task) {

        return;
    }


    const today =
        getDateKey();


    if (
        task.date !==
        today
    ) {

        alert(
            "這個短期任務今天無法完成。"
        );


        return;
    }


    appData.points +=
        1;


    appData.records.push({

        id:
            createId(),

        timestamp:
            new Date()
                .toISOString(),

        date:
            today,

        type:
            "shortTask",

        name:
            task.name,

        delta:
            1,

        shortTaskId:
            task.id,

        shortTaskName:
            task.name,

        shortTaskDate:
            task.date,

        undone:
            false
    });


    appData.shortTasks =
        appData.shortTasks.filter(
            item =>
                item.id !==
                taskId
        );


    saveData();

    renderAll();
}


function renderDailyProgress() {

    const today =
        getDateKey();


    const todayRecords =
        appData.records.filter(
            record =>

                record.date ===
                    today &&

                [
                    "task",
                    "shortTask",
                    "achievement"
                ].includes(
                    record.type
                ) &&

                record.delta ===
                    1 &&

                record.undone !==
                    true
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
        (
            light,
            index
        ) => {

            light.classList.toggle(
                "active",
                index <
                    completed
            );
        }
    );
}


/* =====================================================
   撤銷 +1
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


    const lastRecord =
        visibleTodayRecords[
            visibleTodayRecords.length -
            1
        ];


    const isPositiveRecord =

        [
            "task",
            "shortTask",
            "achievement"
        ].includes(
            lastRecord.type
        ) &&

        lastRecord.delta ===
            1;


    if (
        !isPositiveRecord
    ) {

        alert(
            "最近一筆不是加分紀錄，無法取消。"
        );


        return;
    }


    if (
        appData.points <
        1
    ) {

        alert(
            "目前可用點數不足 1 點。\n\n這筆點數可能已經被兌換使用，請先撤銷相關兌換。"
        );


        return;
    }


    reversePointRecord(
        lastRecord
    );
}


const undoButton =
    document.getElementById(
        "undoButton"
    );


if (
    undoButton
) {

    undoButton.addEventListener(
        "click",
        undoLastPoint
    );
}


function undoTaskRecord(
    recordId
) {

    const record =
        appData.records.find(
            item =>
                item.id ===
                recordId
        );


    if (!record) {

        return;
    }


    const canUndo =

        [
            "task",
            "shortTask",
            "achievement"
        ].includes(
            record.type
        ) &&

        record.delta ===
            1;


    if (
        !canUndo
    ) {

        return;
    }


    if (
        appData.points <
        1
    ) {

        alert(
            "目前可用點數不足 1 點。\n\n這筆點數可能已經被兌換使用，請先撤銷相關兌換後再撤銷這筆加分。"
        );


        return;
    }


    const confirmed =
        confirm(
            `確定要撤銷「${record.name}」這筆加分嗎？\n\n目前點數會扣回 1 點。`
        );


    if (
        !confirmed
    ) {

        return;
    }


    reversePointRecord(
        record
    );
}


function reversePointRecord(
    record
) {

    appData.points -=
        1;


    if (
        record.type ===
        "shortTask"
    ) {

        const today =
            getDateKey();


        const taskDate =
            record.shortTaskDate ||
            record.date;


        if (
            taskDate ===
            today
        ) {

            const taskId =
                record.shortTaskId ||
                createId();


            const taskName =
                record.shortTaskName ||
                record.name;


            const alreadyExists =
                appData.shortTasks.some(
                    task =>

                        task.id ===
                            taskId ||

                        (
                            task.name ===
                                taskName &&

                            task.date ===
                                taskDate
                        )
                );


            if (
                !alreadyExists
            ) {

                appData.shortTasks.push({

                    id:
                        taskId,

                    name:
                        taskName,

                    date:
                        taskDate
                });
            }
        }
    }


    appData.records =
        appData.records.filter(
            item =>
                item.id !==
                record.id
        );


    saveData();

    renderAll();
}


/* =====================================================
   管理：獎勵
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


if (
    addGoalButton
) {

    addGoalButton.addEventListener(
        "click",
        addGoal
    );
}


function renderManageGoals() {

    const select =
        document.getElementById(
            "goalDeleteSelect"
        );


    const deleteButton =
        document.getElementById(
            "deleteGoalButton"
        );


    if (!select) {

        return;
    }


    const oldValue =
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

        appData.goals.length ===
        0

            ? "目前沒有獎勵"

            : "請選擇獎勵";


    select.appendChild(
        placeholder
    );


    [
        ...appData.goals
    ]
        .sort(
            (a, b) =>
                a.points -
                b.points
        )
        .forEach(
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
                oldValue
        )
    ) {

        select.value =
            oldValue;
    }


    select.disabled =
        appData.goals.length ===
        0;


    if (
        deleteButton
    ) {

        deleteButton.disabled =
            !select.value;
    }
}


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


    if (
        !confirmed
    ) {

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


if (
    goalDeleteSelect
) {

    goalDeleteSelect.addEventListener(
        "change",
        function () {

            if (
                deleteGoalButton
            ) {

                deleteGoalButton.disabled =
                    !goalDeleteSelect.value;
            }
        }
    );
}


if (
    deleteGoalButton
) {

    deleteGoalButton.addEventListener(
        "click",
        deleteSelectedGoal
    );
}


/* =====================================================
   兌換獎勵
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


    if (
        !confirmed
    ) {

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


    appData.goals =
        appData.goals.filter(
            item =>
                item.id !==
                goalId
        );


    saveData();

    renderAll();
}


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
        rewardPoints <=
        0
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


    if (
        !confirmed
    ) {

        return;
    }


    appData.points +=
        rewardPoints;


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
   管理：固定加分事項
===================================================== */

function addTask() {

    const taskNameInput =
        document.getElementById(
            "taskName"
        );


    if (
        !taskNameInput
    ) {

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


const addTaskButton =
    document.getElementById(
        "addTaskButton"
    );


if (
    addTaskButton
) {

    addTaskButton.addEventListener(
        "click",
        addTask
    );
}


function renderManageTasks() {

    const select =
        document.getElementById(
            "taskDeleteSelect"
        );


    const deleteButton =
        document.getElementById(
            "deleteTaskButton"
        );


    if (!select) {

        return;
    }


    const oldValue =
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

        appData.tasks.length ===
        0

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
                oldValue
        )
    ) {

        select.value =
            oldValue;
    }


    select.disabled =
        appData.tasks.length ===
        0;


    if (
        deleteButton
    ) {

        deleteButton.disabled =
            !select.value;
    }
}


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


    if (
        !confirmed
    ) {

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


if (
    taskDeleteSelect
) {

    taskDeleteSelect.addEventListener(
        "change",
        function () {

            if (
                deleteTaskButton
            ) {

                deleteTaskButton.disabled =
                    !taskDeleteSelect.value;
            }
        }
    );
}


if (
    deleteTaskButton
) {

    deleteTaskButton.addEventListener(
        "click",
        deleteSelectedTask
    );
}


/* =====================================================
   管理：短期任務
===================================================== */

function addShortTask() {

    const nameInput =
        document.getElementById(
            "shortTaskName"
        );


    const dateInput =
        document.getElementById(
            "shortTaskDate"
        );


    if (
        !nameInput ||
        !dateInput
    ) {

        return;
    }


    const name =
        nameInput
            .value
            .trim();


    const date =
        dateInput.value;


    if (!name) {

        alert(
            "請輸入短期任務名稱。"
        );


        return;
    }


    if (!date) {

        alert(
            "請選擇短期任務日期。"
        );


        return;
    }


    const today =
        getDateKey();


    if (
        date <
        today
    ) {

        alert(
            "短期任務不能設定在已經過去的日期。"
        );


        return;
    }


    const alreadyExists =
        appData.shortTasks.some(
            task =>

                task.name ===
                    name &&

                task.date ===
                    date
        );


    if (
        alreadyExists
    ) {

        alert(
            "這一天已經有相同的短期任務。"
        );


        return;
    }


    appData.shortTasks.push({

        id:
            createId(),

        name:
            name,

        date:
            date
    });


    saveData();


    nameInput.value =
        "";


    dateInput.value =
        "";


    renderAll();


    alert(
        "短期任務已新增。"
    );
}


const addShortTaskButton =
    document.getElementById(
        "addShortTaskButton"
    );


if (
    addShortTaskButton
) {

    addShortTaskButton.addEventListener(
        "click",
        addShortTask
    );
}


function renderManageShortTasks() {

    const select =
        document.getElementById(
            "shortTaskDeleteSelect"
        );


    const deleteButton =
        document.getElementById(
            "deleteShortTaskButton"
        );


    if (!select) {

        return;
    }


    const oldValue =
        select.value;


    const today =
        getDateKey();


    const futureTasks =
        [
            ...appData.shortTasks
        ]
            .filter(
                task =>
                    task.date >=
                    today
            )
            .sort(
                (a, b) => {

                    if (
                        a.date !==
                        b.date
                    ) {

                        return (
                            a.date.localeCompare(
                                b.date
                            )
                        );
                    }


                    return (
                        a.name.localeCompare(
                            b.name,
                            "zh-TW"
                        )
                    );
                }
            );


    select.innerHTML =
        "";


    const placeholder =
        document.createElement(
            "option"
        );


    placeholder.value =
        "";


    placeholder.textContent =

        futureTasks.length ===
        0

            ? "目前沒有已安排任務"

            : "請選擇短期任務";


    select.appendChild(
        placeholder
    );


    futureTasks.forEach(
        task => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                task.id;


            option.textContent =
                `${formatDateKeyShort(task.date)}　${task.name}`;


            select.appendChild(
                option
            );
        }
    );


    if (
        futureTasks.some(
            task =>
                task.id ===
                oldValue
        )
    ) {

        select.value =
            oldValue;
    }


    select.disabled =
        futureTasks.length ===
        0;


    if (
        deleteButton
    ) {

        deleteButton.disabled =
            !select.value;
    }
}


function deleteShortTask(
    taskId
) {

    const task =
        appData.shortTasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task) {

        return;
    }


    const confirmed =
        confirm(
            `確定要刪除「${formatDateKeyShort(task.date)}　${task.name}」嗎？\n\n不會影響點數或過去紀錄。`
        );


    if (
        !confirmed
    ) {

        return;
    }


    appData.shortTasks =
        appData.shortTasks.filter(
            item =>
                item.id !==
                taskId
        );


    saveData();

    renderAll();
}


function deleteSelectedShortTask() {

    const select =
        document.getElementById(
            "shortTaskDeleteSelect"
        );


    if (
        !select ||
        !select.value
    ) {

        alert(
            "請先選擇要刪除的短期任務。"
        );


        return;
    }


    deleteShortTask(
        select.value
    );
}


const shortTaskDeleteSelect =
    document.getElementById(
        "shortTaskDeleteSelect"
    );


const deleteShortTaskButton =
    document.getElementById(
        "deleteShortTaskButton"
    );


if (
    shortTaskDeleteSelect
) {

    shortTaskDeleteSelect.addEventListener(
        "change",
        function () {

            if (
                deleteShortTaskButton
            ) {

                deleteShortTaskButton.disabled =
                    !shortTaskDeleteSelect.value;
            }
        }
    );
}


if (
    deleteShortTaskButton
) {

    deleteShortTaskButton.addEventListener(
        "click",
        deleteSelectedShortTask
    );
}


/* =====================================================
   第四頁：週紀錄
===================================================== */

const previousWeekButton =
    document.getElementById(
        "previousWeek"
    );


const nextWeekButton =
    document.getElementById(
        "nextWeek"
    );


if (
    previousWeekButton
) {

    previousWeekButton.addEventListener(
        "click",
        function () {

            currentWeekOffset -=
                1;


            renderWeeklyRecord();
        }
    );
}


if (
    nextWeekButton
) {

    nextWeekButton.addEventListener(
        "click",
        function () {

            currentWeekOffset +=
                1;


            renderWeeklyRecord();
        }
    );
}


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


    let monday =
        getMonday(
            new Date()
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

                        record.delta >
                        0

                            ? `+${record.delta}`

                            : String(
                                record.delta
                            );


                    item.appendChild(
                        name
                    );


                    const canUndo =

                        record.type ===
                            "redeem" ||

                        (
                            [
                                "task",
                                "shortTask",
                                "achievement"
                            ].includes(
                                record.type
                            ) &&

                            record.delta ===
                                1
                        );


                    if (
                        canUndo
                    ) {

                        const rightArea =
                            document.createElement(
                                "div"
                            );


                        rightArea.className =
                            "record-actions";


                        const undoRecordButton =
                            document.createElement(
                                "button"
                            );


                        undoRecordButton.className =
                            "undo-record-button";


                        undoRecordButton.textContent =
                            "撤銷";


                        undoRecordButton
                            .addEventListener(
                                "click",
                                function () {

                                    if (
                                        record.type ===
                                        "redeem"
                                    ) {

                                        undoRedeem(
                                            record.id
                                        );

                                    } else {

                                        undoTaskRecord(
                                            record.id
                                        );
                                    }
                                }
                            );


                        rightArea.appendChild(
                            delta
                        );


                        rightArea.appendChild(
                            undoRecordButton
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
   匯出 CSV
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

                record.delta >
                0

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
                                    ).replaceAll(
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


const backupButton =
    document.getElementById(
        "backupButton"
    );


if (
    backupButton
) {

    backupButton.addEventListener(
        "click",
        exportRecords
    );
}


/* =====================================================
   PWA Service Worker
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
   一次重新整理所有畫面
===================================================== */

function renderAll() {

    cleanupExpiredShortTasks();


    renderPoints();

    renderAchievements();

    renderGoals();


    renderTasks();

    renderShortTasks();


    renderManageGoals();

    renderManageTasks();

    renderManageShortTasks();

    renderManageAccordion();


    renderDailyProgress();

    renderWeeklyRecord();
}


/* =====================================================
   App 啟動
===================================================== */

setupManageAccordion();

renderAll();