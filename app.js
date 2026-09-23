/* =====================================================
   我的點數 App
   app.js
===================================================== */

const STORAGE_KEY = "myRewardAppData";
const BACKUP_APP_ID = "myRewardApp";
const BACKUP_VERSION = 1;

const SPECIAL_NEW_TASK = "__new_task__";
const SPECIAL_NEW_GOAL = "__new_goal__";

let currentWeekOffset = 0;
let currentManageSection = null;
let modalConfirmAction = null;


/* =====================================================
   預設資料
===================================================== */

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

    shortTasks: [],

    milestoneTaskIds: [],

    appCreatedDate:
        getDateKey(),

    lastWeeklySummaryWeek:
        null,

    lastBackupDate:
        null,

    nextBackupReminderDate:
        getFirstDayOfNextMonthKey(
            new Date()
        ),

    records: []
};


let appData =
    loadData();


/* =====================================================
   基本資料
===================================================== */

function createId() {
    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );
}


function normalizeData(data) {

    const goals =
        Array.isArray(
            data?.goals
        )
            ? data.goals
            : [];


    const tasks =
        Array.isArray(
            data?.tasks
        )
            ? data.tasks
            : [];


    const shortTasks =
        Array.isArray(
            data?.shortTasks
        )
            ? data.shortTasks
            : [];


    const records =
        Array.isArray(
            data?.records
        )
            ? data.records
            : [];


    const validTaskIds =
        new Set(
            tasks.map(
                task =>
                    String(
                        task.id
                    )
            )
        );


    let milestoneTaskIds =
        [];


    /*
    新版：多選里程碑
    */

    if (
        Array.isArray(
            data?.milestoneTaskIds
        )
    ) {

        milestoneTaskIds =
            data.milestoneTaskIds

                .filter(
                    id =>
                        typeof id ===
                            "string" &&
                        id
                )

                .filter(
                    id =>
                        validTaskIds.has(
                            String(
                                id
                            )
                        )
                );
    }


    /*
    舊版：
    milestoneTaskId

    自動轉成：
    milestoneTaskIds
    */

    else if (
        typeof data?.milestoneTaskId ===
            "string" &&
        data.milestoneTaskId &&
        validTaskIds.has(
            String(
                data.milestoneTaskId
            )
        )
    ) {

        milestoneTaskIds = [
            data.milestoneTaskId
        ];
    }


    const earliestRecordDate =
        records

            .map(
                record =>
                    record?.date
            )

            .filter(
                date =>
                    isValidDateKey(
                        date
                    )
            )

            .sort()[0] ||
        null;


    const appCreatedDate =
        isValidDateKey(
            data?.appCreatedDate
        )
            ? data.appCreatedDate

            : earliestRecordDate ||
              getDateKey();


    return {

        points:
            typeof data?.points ===
                "number" &&
            Number.isFinite(
                data.points
            )
                ? data.points
                : 0,


        goals,


        tasks,


        shortTasks,


        milestoneTaskIds,


        appCreatedDate,


        lastWeeklySummaryWeek:
            isValidDateKey(
                data?.lastWeeklySummaryWeek
            )
                ? data.lastWeeklySummaryWeek
                : null,


        lastBackupDate:
            isValidDateKey(
                data?.lastBackupDate
            )
                ? data.lastBackupDate
                : null,


        nextBackupReminderDate:
            isValidDateKey(
                data?.nextBackupReminderDate
            )
                ? data.nextBackupReminderDate

                : getFirstDayOfNextMonthKey(
                    new Date()
                ),


        records
    };
}


function loadData() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        const fresh =
            JSON.parse(
                JSON.stringify(
                    defaultData
                )
            );


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                fresh
            )
        );


        return fresh;
    }


    try {

        return normalizeData(
            JSON.parse(
                saved
            )
        );

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


function getYesterdayKey() {

    const yesterday =
        new Date();


    yesterday.setDate(
        yesterday.getDate() - 1
    );


    return getDateKey(
        yesterday
    );
}


function getMonday(date) {

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


    result.setDate(
        result.getDate() +
        (
            day === 0
                ? -6
                : 1 - day
        )
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


function formatShortDate(date) {

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


function formatDateForDisplay(
    dateKey
) {

    return String(
        dateKey
    ).replaceAll(
        "-",
        "/"
    );
}


function isValidDateKey(
    value
) {

    if (
        typeof value !==
            "string" ||

        !/^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {
        return false;
    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    return (
        !Number.isNaN(
            date.getTime()
        ) &&

        getDateKey(
            date
        ) ===
            value
    );
}


function getFirstDayOfNextMonthKey(
    date = new Date()
) {

    const nextMonth =
        new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            1
        );


    return getDateKey(
        nextMonth
    );
}


function getBackupStartDate() {

    const dates =
        [];


    if (
        isValidDateKey(
            appData.appCreatedDate
        )
    ) {

        dates.push(
            appData.appCreatedDate
        );
    }


    appData.records.forEach(
        record => {

            if (
                isValidDateKey(
                    record?.date
                )
            ) {

                dates.push(
                    record.date
                );
            }
        }
    );


    return (
        dates.sort()[0] ||
        getDateKey()
    );
}


function cleanupExpiredShortTasks() {

    const today =
        getDateKey();


    const before =
        appData.shortTasks.length;


    appData.shortTasks =
        appData.shortTasks.filter(
            task =>
                task.date >=
                today
        );


    if (
        appData.shortTasks.length !==
        before
    ) {

        saveData();
    }
}


/* =====================================================
   頁面切換
===================================================== */

const pages =
    document.querySelectorAll(
        ".page"
    );


const navButtons =
    document.querySelectorAll(
        ".nav-button"
    );


function switchPage(
    pageName
) {

    pages.forEach(
        page =>
            page.classList.remove(
                "active"
            )
    );


    navButtons.forEach(
        button =>
            button.classList.remove(
                "active"
            )
    );


    const targetPage =
        document.getElementById(
            `page-${pageName}`
        );


    const targetNav =
        document.querySelector(
            `.nav-button[data-page="${pageName}"]`
        );


    if (targetPage) {

        targetPage.classList.add(
            "active"
        );
    }


    if (targetNav) {

        targetNav.classList.add(
            "active"
        );
    }


    if (
        pageName ===
        "record"
    ) {

        renderWeeklyRecord();
    }
}


navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                switchPage(
                    button.dataset.page
                );
            }
        );
    }
);


/* =====================================================
   設定頁：摺疊選單
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
    },


    milestone: {
        toggleId:
            "manageMilestoneToggle",

        contentId:
            "manageMilestoneContent"
    },


    backfill: {
        toggleId:
            "manageBackfillToggle",

        contentId:
            "manageBackfillContent"
    },


    data: {
        toggleId:
            "manageDataToggle",

        contentId:
            "manageDataContent"
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


function goToManageSection(
    sectionName,
    focusId
) {

    switchPage(
        "manage"
    );


    currentManageSection =
        sectionName;


    renderManageAccordion();


    window.setTimeout(
        () => {

            const element =
                document.getElementById(
                    focusId
                );


            if (!element) {
                return;
            }


            element.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center"
            });


            element.focus();

        },
        120
    );
}


/* =====================================================
   自訂確認視窗
===================================================== */

const appModal =
    document.getElementById(
        "appModal"
    );


const modalTitle =
    document.getElementById(
        "modalTitle"
    );


const modalMessage =
    document.getElementById(
        "modalMessage"
    );


const modalCancelButton =
    document.getElementById(
        "modalCancelButton"
    );


const modalConfirmButton =
    document.getElementById(
        "modalConfirmButton"
    );


function openModal({
    title,
    message,
    confirmText = "確定",
    cancelText = "取消",
    onConfirm = null
}) {

    if (
        !appModal ||
        !modalTitle ||
        !modalMessage ||
        !modalCancelButton ||
        !modalConfirmButton
    ) {
        return;
    }


    modalTitle.textContent =
        title;


    modalMessage.textContent =
        message;


    modalCancelButton.textContent =
        cancelText;


    modalConfirmButton.textContent =
        confirmText;


    modalConfirmAction =
        onConfirm;


    appModal.hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );


    modalConfirmButton.focus();
}


function closeModal() {

    if (!appModal) {
        return;
    }


    appModal.hidden =
        true;


    document.body.classList.remove(
        "modal-open"
    );


    modalConfirmAction =
        null;
}


if (modalCancelButton) {

    modalCancelButton.addEventListener(
        "click",
        closeModal
    );
}


if (modalConfirmButton) {

    modalConfirmButton.addEventListener(
        "click",
        function () {

            const action =
                modalConfirmAction;


            closeModal();


            if (
                typeof action ===
                "function"
            ) {

                action();
            }
        }
    );
}


if (appModal) {

    appModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                appModal
            ) {

                closeModal();
            }
        }
    );
}


window.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
                "Escape" &&

            appModal &&

            !appModal.hidden
        ) {

            closeModal();
        }
    }
);


/* =====================================================
   能量艙：目前點數
===================================================== */

function renderPoints() {

    const element =
        document.getElementById(
            "totalPoints"
        );


    if (element) {

        element.textContent =
            appData.points;
    }
}


/* =====================================================
   能量艙：今日功績
===================================================== */

function getTodayAchievements() {

    const today =
        getDateKey();


    return appData.records.filter(
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
}


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


    const achievements =
        getTodayAchievements();


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


    if (openButton) {

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
        input.value.trim();


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

    openAchievementFormButton.addEventListener(
        "click",
        openAchievementForm
    );
}


if (
    cancelAchievementButton
) {

    cancelAchievementButton.addEventListener(
        "click",
        closeAchievementForm
    );
}


if (
    addAchievementButton
) {

    addAchievementButton.addEventListener(
        "click",
        addAchievement
    );
}


if (
    achievementInput
) {

    achievementInput.addEventListener(
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
   能量艙：獎勵兌換處
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
        [...appData.goals].sort(
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


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "redeem-button";


            button.textContent =
                "兌換";


            button.disabled =
                appData.points <
                goal.points;


            button.addEventListener(
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
                button
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
            `兌換：${goal.name}`,


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
            ) ||
            0
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


    if (!confirmed) {
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
   賺經驗：固定加分事項
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


        taskId:
            task.id,


        delta:
            1,


        undone:
            false
    });


    saveData();


    renderAll();
}


/* =====================================================
   賺經驗：里程碑
===================================================== */

function getMilestoneTasks() {

    const selectedIds =
        new Set(
            Array.isArray(
                appData.milestoneTaskIds
            )
                ? appData.milestoneTaskIds
                : []
        );


    return appData.tasks.filter(
        task =>
            selectedIds.has(
                task.id
            )
    );
}


function getMilestoneCount(
    task
) {

    if (!task) {
        return 0;
    }


    return appData.records.reduce(
        (
            total,
            record
        ) => {

            if (
                record.type !==
                    "task" ||

                record.undone ===
                    true
            ) {

                return total;
            }


            const amount =
                Number(
                    record.delta
                );


            if (
                !Number.isFinite(
                    amount
                ) ||

                amount <=
                    0
            ) {

                return total;
            }


            const sameTask =
                record.taskId

                    ? String(
                        record.taskId
                    ) ===
                      String(
                          task.id
                      )

                    : record.name ===
                      task.name;


            return sameTask
                ? total + amount
                : total;
        },
        0
    );
}


function renderMilestones() {

    const section =
        document.getElementById(
            "milestoneSection"
        );


    const list =
        document.getElementById(
            "milestoneList"
        );


    if (
        !section ||
        !list
    ) {
        return;
    }


    const tasks =
        getMilestoneTasks();


    list.innerHTML =
        "";


    if (
        tasks.length ===
        0
    ) {

        section.hidden =
            true;


        return;
    }


    tasks.forEach(
        task => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "milestone-row";


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "milestone-name";


            name.textContent =
                task.name;


            const count =
                document.createElement(
                    "span"
                );


            count.className =
                "milestone-count";


            count.textContent =
                `累積 ${getMilestoneCount(task)} 次`;


            row.appendChild(
                name
            );


            row.appendChild(
                count
            );


            list.appendChild(
                row
            );
        }
    );


    section.hidden =
        false;
}


/* =====================================================
   設定：里程碑
===================================================== */

function setMilestoneTaskSelected(
    taskId,
    selected
) {

    const current =
        new Set(
            Array.isArray(
                appData.milestoneTaskIds
            )
                ? appData.milestoneTaskIds
                : []
        );


    if (selected) {

        current.add(
            taskId
        );

    } else {

        current.delete(
            taskId
        );
    }


    appData.milestoneTaskIds =
        appData.tasks

            .filter(
                task =>
                    current.has(
                        task.id
                    )
            )

            .map(
                task =>
                    task.id
            );


    saveData();


    renderMilestones();
}


function renderMilestoneSettings() {

    const checklist =
        document.getElementById(
            "milestoneChecklist"
        );


    if (!checklist) {
        return;
    }


    checklist.innerHTML =
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
            "milestone-checklist-empty";


        empty.textContent =
            "目前沒有加分事項";


        checklist.appendChild(
            empty
        );


        return;
    }


    const selectedIds =
        new Set(
            Array.isArray(
                appData.milestoneTaskIds
            )
                ? appData.milestoneTaskIds
                : []
        );


    appData.tasks.forEach(
        task => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "milestone-check-row";


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.checked =
                selectedIds.has(
                    task.id
                );


            checkbox.value =
                task.id;


            checkbox.setAttribute(
                "aria-label",
                `顯示 ${task.name} 里程碑`
            );


            const box =
                document.createElement(
                    "span"
                );


            box.className =
                "milestone-check-box";


            box.setAttribute(
                "aria-hidden",
                "true"
            );


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "milestone-check-name";


            name.textContent =
                task.name;


            checkbox.addEventListener(
                "change",
                function () {

                    setMilestoneTaskSelected(
                        task.id,
                        checkbox.checked
                    );
                }
            );


            label.appendChild(
                checkbox
            );


            label.appendChild(
                box
            );


            label.appendChild(
                name
            );


            checklist.appendChild(
                label
            );
        }
    );
}


/* =====================================================
   賺經驗：短期任務
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


/* =====================================================
   今日進度
===================================================== */

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
   撤銷加分
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


    const amount =
        Number(
            record.delta
        );


    const canUndo =
        [
            "task",
            "shortTask",
            "achievement"
        ].includes(
            record.type
        ) &&

        Number.isFinite(
            amount
        ) &&

        amount >
            0;


    if (!canUndo) {
        return;
    }


    if (
        appData.points <
        amount
    ) {

        alert(
            `目前可用點數不足 ${amount} 點。\n\n這筆點數可能已經被兌換使用，請先撤銷相關兌換後再撤銷這筆加分。`
        );


        return;
    }


    const confirmed =
        confirm(
            `確定要撤銷「${record.name}」這筆加分嗎？\n\n目前點數會扣回 ${amount} 點。`
        );


    if (!confirmed) {
        return;
    }


    reversePointRecord(
        record
    );
}


function reversePointRecord(
    record
) {

    const amount =
        Number(
            record.delta
        );


    if (
        !Number.isFinite(
            amount
        ) ||

        amount <=
        0
    ) {
        return;
    }


    appData.points -=
        amount;


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
   設定：獎勵
===================================================== */

function addGoal() {

    const nameInput =
        document.getElementById(
            "goalName"
        );


    const pointsInput =
        document.getElementById(
            "goalPoints"
        );


    if (
        !nameInput ||
        !pointsInput
    ) {
        return;
    }


    const name =
        nameInput.value.trim();


    const points =
        Number(
            pointsInput.value
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

        points <=
        0
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


    nameInput.value =
        "";


    pointsInput.value =
        "";


    renderAll();


    alert(
        "獎勵已新增。"
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


    [...appData.goals]

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


    if (deleteButton) {

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


const addGoalButton =
    document.getElementById(
        "addGoalButton"
    );


const goalDeleteSelect =
    document.getElementById(
        "goalDeleteSelect"
    );


const deleteGoalButton =
    document.getElementById(
        "deleteGoalButton"
    );


if (addGoalButton) {

    addGoalButton.addEventListener(
        "click",
        addGoal
    );
}


if (goalDeleteSelect) {

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


if (deleteGoalButton) {

    deleteGoalButton.addEventListener(
        "click",
        deleteSelectedGoal
    );
}


/* =====================================================
   設定：固定加分事項
===================================================== */

function addTask() {

    const input =
        document.getElementById(
            "taskName"
        );


    if (!input) {
        return;
    }


    const name =
        input.value.trim();


    if (!name) {

        alert(
            "請輸入事項名稱。"
        );


        return;
    }


    if (
        appData.tasks.some(
            task =>
                task.name ===
                name
        )
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


    input.value =
        "";


    renderAll();


    alert(
        "加分事項已新增。"
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


    if (deleteButton) {

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


    if (!confirmed) {
        return;
    }


    appData.tasks =
        appData.tasks.filter(
            item =>
                item.id !==
                taskId
        );


    appData.milestoneTaskIds =
        (
            appData.milestoneTaskIds ||
            []
        ).filter(
            id =>
                id !==
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


const addTaskButton =
    document.getElementById(
        "addTaskButton"
    );


const taskDeleteSelect =
    document.getElementById(
        "taskDeleteSelect"
    );


const deleteTaskButton =
    document.getElementById(
        "deleteTaskButton"
    );


if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        addTask
    );
}


if (taskDeleteSelect) {

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


if (deleteTaskButton) {

    deleteTaskButton.addEventListener(
        "click",
        deleteSelectedTask
    );
}


/* =====================================================
   設定：短期任務
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
        nameInput.value.trim();


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


    if (alreadyExists) {

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
        [...appData.shortTasks]

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

                        return a.date.localeCompare(
                            b.date
                        );
                    }


                    return a.name.localeCompare(
                        b.name,
                        "zh-TW"
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


    if (deleteButton) {

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


    if (!confirmed) {
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


const addShortTaskButton =
    document.getElementById(
        "addShortTaskButton"
    );


const shortTaskDeleteSelect =
    document.getElementById(
        "shortTaskDeleteSelect"
    );


const deleteShortTaskButton =
    document.getElementById(
        "deleteShortTaskButton"
    );


if (addShortTaskButton) {

    addShortTaskButton.addEventListener(
        "click",
        addShortTask
    );
}


if (shortTaskDeleteSelect) {

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


if (deleteShortTaskButton) {

    deleteShortTaskButton.addEventListener(
        "click",
        deleteSelectedShortTask
    );
}


/* =====================================================
   設定：補登
===================================================== */

function renderBackfillOptions() {

    const taskSelect =
        document.getElementById(
            "backfillTaskSelect"
        );


    const goalSelect =
        document.getElementById(
            "backfillGoalSelect"
        );


    const pointsInput =
        document.getElementById(
            "backfillPointsInput"
        );


    const taskDateInput =
        document.getElementById(
            "backfillTaskDate"
        );


    const goalDateInput =
        document.getElementById(
            "backfillGoalDate"
        );


    if (taskSelect) {

        const oldValue =
            taskSelect.value;


        taskSelect.innerHTML =
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
                : "選擇加分事項";


        taskSelect.appendChild(
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


                taskSelect.appendChild(
                    option
                );
            }
        );


        const newOption =
            document.createElement(
                "option"
            );


        newOption.value =
            SPECIAL_NEW_TASK;


        newOption.textContent =
            "找不到？先新增加分事項";


        taskSelect.appendChild(
            newOption
        );


        if (
            appData.tasks.some(
                task =>
                    task.id ===
                    oldValue
            )
        ) {

            taskSelect.value =
                oldValue;
        }
    }


    if (goalSelect) {

        const oldValue =
            goalSelect.value;


        goalSelect.innerHTML =
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
                : "選擇獎勵";


        goalSelect.appendChild(
            placeholder
        );


        [...appData.goals]

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


                    goalSelect.appendChild(
                        option
                    );
                }
            );


        const newOption =
            document.createElement(
                "option"
            );


        newOption.value =
            SPECIAL_NEW_GOAL;


        newOption.textContent =
            "找不到？先新增獎勵";


        goalSelect.appendChild(
            newOption
        );


        if (
            appData.goals.some(
                goal =>
                    goal.id ===
                    oldValue
            )
        ) {

            goalSelect.value =
                oldValue;
        }
    }


    if (
        pointsInput &&
        !pointsInput.value
    ) {

        pointsInput.value =
            "1";
    }


    const yesterday =
        getYesterdayKey();


    [
        taskDateInput,
        goalDateInput
    ].forEach(
        input => {

            if (!input) {
                return;
            }


            input.max =
                yesterday;


            if (
                !input.value ||
                input.value >=
                    getDateKey()
            ) {

                input.value =
                    yesterday;
            }
        }
    );
}


function askToCreateTask() {

    const select =
        document.getElementById(
            "backfillTaskSelect"
        );


    if (select) {

        select.value =
            "";
    }


    openModal({

        title:
            "前往加分事項？",


        message:
            "要補登的事項需要先建立。\n\n是否前往「加分事項」新增項目？",


        confirmText:
            "前往",


        onConfirm:
            function () {

                goToManageSection(
                    "task",
                    "taskName"
                );
            }
    });
}


function askToCreateGoal() {

    const select =
        document.getElementById(
            "backfillGoalSelect"
        );


    if (select) {

        select.value =
            "";
    }


    openModal({

        title:
            "前往獎勵？",


        message:
            "要補登的獎勵需要先建立。\n\n是否前往「獎勵」新增項目？",


        confirmText:
            "前往",


        onConfirm:
            function () {

                goToManageSection(
                    "goal",
                    "goalName"
                );
            }
    });
}


function validateBackfillDate(
    date
) {

    const today =
        getDateKey();


    if (!date) {

        alert(
            "請選擇補登日期。"
        );


        return false;
    }


    if (
        date >=
        today
    ) {

        alert(
            "補登只能選擇今天以前的日期。"
        );


        return false;
    }


    return true;
}


function requestBackfillPoints() {

    const select =
        document.getElementById(
            "backfillTaskSelect"
        );


    const pointsInput =
        document.getElementById(
            "backfillPointsInput"
        );


    const dateInput =
        document.getElementById(
            "backfillTaskDate"
        );


    if (
        !select ||
        !pointsInput ||
        !dateInput
    ) {
        return;
    }


    if (!select.value) {

        alert(
            "請先選擇要補登的加分事項。"
        );


        return;
    }


    if (
        select.value ===
        SPECIAL_NEW_TASK
    ) {

        askToCreateTask();


        return;
    }


    const task =
        appData.tasks.find(
            item =>
                item.id ===
                select.value
        );


    const amount =
        Number(
            pointsInput.value
        );


    const date =
        dateInput.value;


    if (!task) {

        alert(
            "找不到這個加分事項，請重新選擇。"
        );


        renderBackfillOptions();


        return;
    }


    if (
        !Number.isInteger(
            amount
        ) ||

        amount <=
        0
    ) {

        alert(
            "「加幾點」請輸入 1 以上的整數。"
        );


        return;
    }


    if (
        !validateBackfillDate(
            date
        )
    ) {
        return;
    }


    openModal({

        title:
            "確認補登",


        message:
            `${task.name}\n` +
            `${formatDateForDisplay(date)}\n` +
            `+${amount} 點\n\n` +
            "這筆紀錄會加入戰績。",


        confirmText:
            "確定補登",


        onConfirm:
            function () {

                commitBackfillPoints(
                    task.id,
                    amount,
                    date
                );
            }
    });
}


function commitBackfillPoints(
    taskId,
    amount,
    date
) {

    const task =
        appData.tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task) {

        alert(
            "這個加分事項已不存在，請重新操作。"
        );


        renderAll();


        return;
    }


    if (
        !validateBackfillDate(
            date
        )
    ) {
        return;
    }


    appData.points +=
        amount;


    appData.records.push({

        id:
            createId(),


        timestamp:
            new Date()
                .toISOString(),


        date:
            date,


        type:
            "task",


        name:
            task.name,


        delta:
            amount,


        undone:
            false,


        manual:
            true,


        manualCreatedAt:
            new Date()
                .toISOString(),


        taskId:
            task.id
    });


    saveData();


    resetBackfillPointForm();


    renderAll();


    alert(
        "補加分完成。"
    );
}


function requestBackfillRedeem() {

    const select =
        document.getElementById(
            "backfillGoalSelect"
        );


    const dateInput =
        document.getElementById(
            "backfillGoalDate"
        );


    if (
        !select ||
        !dateInput
    ) {
        return;
    }


    if (!select.value) {

        alert(
            "請先選擇要補登的獎勵。"
        );


        return;
    }


    if (
        select.value ===
        SPECIAL_NEW_GOAL
    ) {

        askToCreateGoal();


        return;
    }


    const goal =
        appData.goals.find(
            item =>
                item.id ===
                select.value
        );


    const date =
        dateInput.value;


    if (!goal) {

        alert(
            "找不到這個獎勵，請重新選擇。"
        );


        renderBackfillOptions();


        return;
    }


    if (
        !validateBackfillDate(
            date
        )
    ) {
        return;
    }


    if (
        appData.points <
        goal.points
    ) {

        alert(
            `目前點數不足。\n\n這項獎勵需要 ${goal.points} 點，目前只有 ${appData.points} 點。\n\n如果有漏記的加分紀錄，請先補登加分。`
        );


        return;
    }


    openModal({

        title:
            "確認補登",


        message:
            `兌換：${goal.name}\n` +
            `${formatDateForDisplay(date)}\n` +
            `-${goal.points} 點\n\n` +
            "補登後，此獎勵會從「獎勵兌換處」移除。",


        confirmText:
            "確定補登",


        onConfirm:
            function () {

                commitBackfillRedeem(
                    goal.id,
                    date
                );
            }
    });
}


function commitBackfillRedeem(
    goalId,
    date
) {

    const goal =
        appData.goals.find(
            item =>
                item.id ===
                goalId
        );


    if (!goal) {

        alert(
            "這個獎勵已不存在，請重新操作。"
        );


        renderAll();


        return;
    }


    if (
        !validateBackfillDate(
            date
        )
    ) {
        return;
    }


    if (
        appData.points <
        goal.points
    ) {

        alert(
            `目前點數不足。\n\n這項獎勵需要 ${goal.points} 點，目前只有 ${appData.points} 點。`
        );


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
            date,


        type:
            "redeem",


        name:
            `兌換：${goal.name}`,


        delta:
            -goal.points,


        goalId:
            goal.id,


        goalName:
            goal.name,


        goalPoints:
            goal.points,


        manual:
            true,


        manualCreatedAt:
            new Date()
                .toISOString()
    });


    appData.goals =
        appData.goals.filter(
            item =>
                item.id !==
                goal.id
        );


    saveData();


    resetBackfillGoalForm();


    renderAll();


    alert(
        "補兌換完成。"
    );
}


function resetBackfillPointForm() {

    const select =
        document.getElementById(
            "backfillTaskSelect"
        );


    const pointsInput =
        document.getElementById(
            "backfillPointsInput"
        );


    const dateInput =
        document.getElementById(
            "backfillTaskDate"
        );


    if (select) {

        select.value =
            "";
    }


    if (pointsInput) {

        pointsInput.value =
            "1";
    }


    if (dateInput) {

        dateInput.value =
            getYesterdayKey();
    }
}


function resetBackfillGoalForm() {

    const select =
        document.getElementById(
            "backfillGoalSelect"
        );


    const dateInput =
        document.getElementById(
            "backfillGoalDate"
        );


    if (select) {

        select.value =
            "";
    }


    if (dateInput) {

        dateInput.value =
            getYesterdayKey();
    }
}


const backfillTaskSelect =
    document.getElementById(
        "backfillTaskSelect"
    );


const backfillGoalSelect =
    document.getElementById(
        "backfillGoalSelect"
    );


const backfillTaskButton =
    document.getElementById(
        "backfillTaskButton"
    );


const backfillGoalButton =
    document.getElementById(
        "backfillGoalButton"
    );


if (backfillTaskSelect) {

    backfillTaskSelect.addEventListener(
        "change",
        function () {

            if (
                backfillTaskSelect.value ===
                SPECIAL_NEW_TASK
            ) {

                askToCreateTask();
            }
        }
    );
}


if (backfillGoalSelect) {

    backfillGoalSelect.addEventListener(
        "change",
        function () {

            if (
                backfillGoalSelect.value ===
                SPECIAL_NEW_GOAL
            ) {

                askToCreateGoal();
            }
        }
    );
}


if (backfillTaskButton) {

    backfillTaskButton.addEventListener(
        "click",
        requestBackfillPoints
    );
}


if (backfillGoalButton) {

    backfillGoalButton.addEventListener(
        "click",
        requestBackfillRedeem
    );
}


/* =====================================================
   戰績
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

                            Number(
                                record.delta
                            ) >
                            0
                        );


                    if (canUndo) {

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


                        undoRecordButton.addEventListener(
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
   設定 → 資料
===================================================== */

function downloadFile(
    content,
    type,
    fileName
) {

    const blob =
        new Blob(
            [
                content
            ],
            {
                type:
                    type
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
        fileName;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );
}


function exportBackup({
    throughYesterday = false,
    fromReminder = false
} = {}) {

    const startDate =
        getBackupStartDate();


    const endDate =
        throughYesterday
            ? getYesterdayKey()
            : getDateKey();


    const today =
        getDateKey();


    appData.lastBackupDate =
        today;


    appData.nextBackupReminderDate =
        getFirstDayOfNextMonthKey(
            new Date()
        );


    saveData();


    const backup = {

        app:
            BACKUP_APP_ID,


        version:
            BACKUP_VERSION,


        exportedAt:
            new Date()
                .toISOString(),


        backupRange: {

            startDate:
                startDate,


            endDate:
                endDate
        },


        data:
            appData
    };


    const jsonContent =
        JSON.stringify(
            backup,
            null,
            2
        );


    downloadFile(
        jsonContent,
        "application/json;charset=utf-8;",
        `我的點數_備份_${startDate}_到_${endDate}.json`
    );


    renderBackupStatus();


    if (fromReminder) {

        closeBackupReminder();
    }
}


function isValidBackupData(
    data
) {

    if (
        !data ||
        typeof data !==
            "object" ||
        Array.isArray(
            data
        )
    ) {
        return false;
    }


    if (
        typeof data.points !==
            "number" ||

        !Number.isFinite(
            data.points
        )
    ) {
        return false;
    }


    return (

        Array.isArray(
            data.goals
        ) &&

        Array.isArray(
            data.tasks
        ) &&

        Array.isArray(
            data.shortTasks
        ) &&

        Array.isArray(
            data.records
        )
    );
}


async function importBackupFile(
    file
) {

    if (!file) {
        return;
    }


    try {

        const text =
            await file.text();


        const backup =
            JSON.parse(
                text
            );


        if (
            !backup ||

            backup.app !==
                BACKUP_APP_ID
        ) {

            alert(
                "無法匯入。\n\n這不是有效的「我的點數」備份檔。"
            );


            return;
        }


        if (
            backup.version !==
            BACKUP_VERSION
        ) {

            alert(
                "無法匯入。\n\n這份備份的版本目前不支援。"
            );


            return;
        }


        if (
            !isValidBackupData(
                backup.data
            )
        ) {

            alert(
                "無法匯入。\n\n備份內容不完整或格式有誤。"
            );


            return;
        }


        let backupDate =
            "未知";


        if (
            backup.exportedAt
        ) {

            const parsedDate =
                new Date(
                    backup.exportedAt
                );


            if (
                !Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                backupDate =
                    parsedDate.toLocaleString(
                        "zh-TW"
                    );
            }
        }


        const confirmed =
            confirm(
                `確定要匯入這份備份嗎？\n\n` +
                `備份日期：${backupDate}\n` +
                `目前點數：${backup.data.points} 點\n` +
                `紀錄：${backup.data.records.length} 筆\n\n` +
                `匯入後會取代目前裝置中的點數、設定與紀錄。`
            );


        if (!confirmed) {
            return;
        }


        appData =
            normalizeData(
                JSON.parse(
                    JSON.stringify(
                        backup.data
                    )
                )
            );


        appData.lastBackupDate =
            getDateKey();


        appData.nextBackupReminderDate =
            getFirstDayOfNextMonthKey(
                new Date()
            );


        saveData();


        currentWeekOffset =
            0;


        currentManageSection =
            "data";


        renderAll();


        alert(
            "備份已匯入。"
        );

    } catch (error) {

        console.error(
            "匯入備份失敗：",
            error
        );


        alert(
            "無法匯入。\n\n請確認選擇的是有效的 JSON 備份檔。"
        );
    }
}


function downloadData() {

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
            "目前還沒有任何可下載的數據。"
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
                    `${record.date}T00:00:00`
                );


            const weekday =
                weekdayNames[
                    date.getDay()
                ];


            const displayDate =
                record.date.replaceAll(
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
                            value =>
                                `"${String(value).replaceAll('"', '""')}"`
                        )

                        .join(",")
            )

            .join("\n");


    downloadFile(
        "\uFEFF" +
        csvContent,

        "text/csv;charset=utf-8;",

        `我的點數_數據_${getDateKey()}.csv`
    );
}


const exportBackupButton =
    document.getElementById(
        "exportBackupButton"
    );


const importBackupButton =
    document.getElementById(
        "importBackupButton"
    );


const importBackupInput =
    document.getElementById(
        "importBackupInput"
    );


const downloadDataButton =
    document.getElementById(
        "downloadDataButton"
    );


if (
    exportBackupButton
) {

    exportBackupButton.addEventListener(
        "click",
        function () {

            exportBackup();
        }
    );
}


if (
    importBackupButton &&
    importBackupInput
) {

    importBackupButton.addEventListener(
        "click",
        function () {

            importBackupInput.value =
                "";


            importBackupInput.click();
        }
    );


    importBackupInput.addEventListener(
        "change",
        function () {

            const file =
                importBackupInput.files &&
                importBackupInput.files[0];


            importBackupFile(
                file
            );
        }
    );
}


if (
    downloadDataButton
) {

    downloadDataButton.addEventListener(
        "click",
        downloadData
    );
}


/* =====================================================
   上週成果卡
===================================================== */

const weeklySummaryModal =
    document.getElementById(
        "weeklySummaryModal"
    );


const weeklySummaryEarned =
    document.getElementById(
        "weeklySummaryEarned"
    );


const weeklySummaryAchievementSection =
    document.getElementById(
        "weeklySummaryAchievementSection"
    );


const weeklySummaryAchievements =
    document.getElementById(
        "weeklySummaryAchievements"
    );


const weeklySummaryTaskSection =
    document.getElementById(
        "weeklySummaryTaskSection"
    );


const weeklySummaryTasks =
    document.getElementById(
        "weeklySummaryTasks"
    );


const weeklySummaryShortTaskSection =
    document.getElementById(
        "weeklySummaryShortTaskSection"
    );


const weeklySummaryShortTasks =
    document.getElementById(
        "weeklySummaryShortTasks"
    );


const weeklySummaryButton =
    document.getElementById(
        "weeklySummaryButton"
    );


function getCurrentWeekKey() {

    return getDateKey(
        getMonday(
            new Date()
        )
    );
}


function getPreviousWeekRecords() {

    const currentMonday =
        getMonday(
            new Date()
        );


    const previousMonday =
        addDays(
            currentMonday,
            -7
        );


    const previousSunday =
        addDays(
            currentMonday,
            -1
        );


    const start =
        getDateKey(
            previousMonday
        );


    const end =
        getDateKey(
            previousSunday
        );


    return appData.records.filter(
        record =>

            record.date >=
                start &&

            record.date <=
                end &&

            record.type !==
                "undo" &&

            record.undone !==
                true
    );
}


/* =====================================================
   上週功績
===================================================== */

function buildWeeklyAchievementSummary(
    records
) {

    return records.filter(
        record =>

            record.type ===
                "achievement" &&

            Number(
                record.delta
            ) >
                0 &&

            record.undone !==
                true
    );
}


/* =====================================================
   上週固定加分事項
===================================================== */

function buildWeeklyTaskSummary(
    records
) {

    const summary =
        new Map();


    records.forEach(
        record => {

            if (
                record.type !==
                "task"
            ) {
                return;
            }


            const amount =
                Number(
                    record.delta
                );


            const name =
                String(
                    record.name ||
                    ""
                ).trim();


            if (
                !name ||

                !Number.isFinite(
                    amount
                ) ||

                amount <=
                    0
            ) {
                return;
            }


            summary.set(
                name,

                (
                    summary.get(
                        name
                    ) ||
                    0
                ) +
                amount
            );
        }
    );


    return [
        ...summary.entries()
    ].map(
        (
            [
                name,
                count
            ]
        ) => ({

            name:
                name,


            count:
                count
        })
    );
}


/* =====================================================
   上週短期任務
===================================================== */

function buildWeeklyShortTaskSummary(
    records
) {

    return records.filter(
        record =>

            record.type ===
                "shortTask" &&

            Number(
                record.delta
            ) >
                0 &&

            record.undone !==
                true
    );
}


/* =====================================================
   顯示上週成果卡
===================================================== */

function openWeeklySummary(
    records
) {

    if (
        !weeklySummaryModal ||
        !weeklySummaryEarned ||
        !weeklySummaryAchievementSection ||
        !weeklySummaryAchievements ||
        !weeklySummaryTaskSection ||
        !weeklySummaryTasks ||
        !weeklySummaryShortTaskSection ||
        !weeklySummaryShortTasks
    ) {
        return false;
    }


    /*
    上週獲得：
    所有正向點數都算。

    包含：
    固定加分事項
    今日功績
    短期任務
    補登加分
    */

    const earnedPoints =
        records.reduce(
            (
                total,
                record
            ) => {

                const amount =
                    Number(
                        record.delta
                    );


                return (
                    Number.isFinite(
                        amount
                    ) &&

                    amount >
                    0
                )
                    ? total +
                      amount

                    : total;
            },
            0
        );


    const achievements =
        buildWeeklyAchievementSummary(
            records
        );


    const taskSummary =
        buildWeeklyTaskSummary(
            records
        );


    const shortTasks =
        buildWeeklyShortTaskSummary(
            records
        );


    weeklySummaryEarned.textContent =
        `${earnedPoints} 點`;


    /* =========================
       上週功績
    ========================== */

    weeklySummaryAchievements.innerHTML =
        "";


    if (
        achievements.length ===
        0
    ) {

        weeklySummaryAchievementSection.hidden =
            true;

    } else {

        weeklySummaryAchievementSection.hidden =
            false;


        achievements.forEach(
            record => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "weekly-summary-achievement-row";


                row.textContent =
                    record.name;


                weeklySummaryAchievements.appendChild(
                    row
                );
            }
        );
    }


    /* =========================
       完成事項
    ========================== */

    weeklySummaryTasks.innerHTML =
        "";


    if (
        taskSummary.length ===
        0
    ) {

        weeklySummaryTaskSection.hidden =
            true;

    } else {

        weeklySummaryTaskSection.hidden =
            false;


        taskSummary.forEach(
            item => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "weekly-summary-task-row";


                const name =
                    document.createElement(
                        "span"
                    );


                name.className =
                    "weekly-summary-task-name";


                name.textContent =
                    item.name;


                const count =
                    document.createElement(
                        "span"
                    );


                count.className =
                    "weekly-summary-task-count";


                count.textContent =
                    `${item.count} 次`;


                row.appendChild(
                    name
                );


                row.appendChild(
                    count
                );


                weeklySummaryTasks.appendChild(
                    row
                );
            }
        );
    }


    /* =========================
       完成短期任務
    ========================== */

    weeklySummaryShortTasks.innerHTML =
        "";


    if (
        shortTasks.length ===
        0
    ) {

        weeklySummaryShortTaskSection.hidden =
            true;

    } else {

        weeklySummaryShortTaskSection.hidden =
            false;


        shortTasks.forEach(
            record => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "weekly-summary-short-task-row";


                row.textContent =
                    record.name;


                weeklySummaryShortTasks.appendChild(
                    row
                );
            }
        );
    }


    weeklySummaryModal.hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );


    if (
        weeklySummaryButton
    ) {

        weeklySummaryButton.focus();
    }


    return true;
}


function closeWeeklySummary() {

    if (
        !weeklySummaryModal
    ) {
        return;
    }


    weeklySummaryModal.hidden =
        true;


    document.body.classList.remove(
        "modal-open"
    );


    /*
    如果這個月剛好也要提醒備份，
    成果卡關閉後再顯示。
    */

    checkBackupReminder();
}


function checkWeeklySummary() {

    const currentWeekKey =
        getCurrentWeekKey();


    if (
        appData.lastWeeklySummaryWeek ===
        currentWeekKey
    ) {

        return false;
    }


    const previousWeekRecords =
        getPreviousWeekRecords();


    /*
    不管上週有沒有紀錄，
    本週都只檢查一次。
    */

    appData.lastWeeklySummaryWeek =
        currentWeekKey;


    saveData();


    if (
        previousWeekRecords.length ===
        0
    ) {

        return false;
    }


    return openWeeklySummary(
        previousWeekRecords
    );
}


if (
    weeklySummaryButton
) {

    weeklySummaryButton.addEventListener(
        "click",
        closeWeeklySummary
    );
}


/* =====================================================
   每月備份提醒
===================================================== */

const backupReminderModal =
    document.getElementById(
        "backupReminderModal"
    );


const backupReminderRange =
    document.getElementById(
        "backupReminderRange"
    );


const backupReminderLastDate =
    document.getElementById(
        "backupReminderLastDate"
    );


const backupReminderLaterButton =
    document.getElementById(
        "backupReminderLaterButton"
    );


const backupReminderNowButton =
    document.getElementById(
        "backupReminderNowButton"
    );


const lastBackupStatus =
    document.getElementById(
        "lastBackupStatus"
    );


function renderBackupStatus() {

    if (
        !lastBackupStatus
    ) {
        return;
    }


    lastBackupStatus.textContent =
        appData.lastBackupDate

            ? `上次備份：${formatDateForDisplay(appData.lastBackupDate)}`

            : "目前尚未建立備份";
}


function openBackupReminder() {

    if (
        !backupReminderModal ||
        !backupReminderRange ||
        !backupReminderLastDate
    ) {
        return false;
    }


    const startDate =
        getBackupStartDate();


    const endDate =
        getYesterdayKey();


    backupReminderRange.textContent =
        `${formatDateForDisplay(startDate)} ～ ${formatDateForDisplay(endDate)}`;


    backupReminderLastDate.textContent =
        appData.lastBackupDate

            ? `上次備份：${formatDateForDisplay(appData.lastBackupDate)}`

            : "上次備份：尚未備份";


    backupReminderModal.hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );


    if (
        backupReminderNowButton
    ) {

        backupReminderNowButton.focus();
    }


    return true;
}


function closeBackupReminder() {

    if (
        !backupReminderModal
    ) {
        return;
    }


    backupReminderModal.hidden =
        true;


    document.body.classList.remove(
        "modal-open"
    );
}


function postponeBackupReminder() {

    const nextDate =
        addDays(
            new Date(),
            7
        );


    appData.nextBackupReminderDate =
        getDateKey(
            nextDate
        );


    saveData();


    closeBackupReminder();
}


function backupFromReminder() {

    exportBackup({

        throughYesterday:
            true,


        fromReminder:
            true
    });
}


function checkBackupReminder() {

    const today =
        getDateKey();


    if (
        !isValidDateKey(
            appData.nextBackupReminderDate
        )
    ) {

        appData.nextBackupReminderDate =
            getFirstDayOfNextMonthKey(
                new Date()
            );


        saveData();


        return false;
    }


    if (
        today <
        appData.nextBackupReminderDate
    ) {

        return false;
    }


    return openBackupReminder();
}


if (
    backupReminderLaterButton
) {

    backupReminderLaterButton.addEventListener(
        "click",
        postponeBackupReminder
    );
}


if (
    backupReminderNowButton
) {

    backupReminderNowButton.addEventListener(
        "click",
        backupFromReminder
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

            navigator.serviceWorker

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
   重新整理所有畫面
===================================================== */

function renderAll() {

    cleanupExpiredShortTasks();


    renderPoints();

    renderAchievements();

    renderGoals();


    renderTasks();

    renderShortTasks();

    renderMilestones();


    renderManageGoals();

    renderManageTasks();

    renderManageShortTasks();

    renderMilestoneSettings();

    renderBackfillOptions();

    renderBackupStatus();

    renderManageAccordion();


    renderDailyProgress();

    renderWeeklyRecord();
}


/* =====================================================
   App 啟動
===================================================== */

setupManageAccordion();


renderAll();


const weeklySummaryOpened =
    checkWeeklySummary();


if (
    !weeklySummaryOpened
) {

    checkBackupReminder();
}