const STORAGE_KEY = "myRewardAppData";
const BACKUP_APP_ID = "myRewardApp";
const BACKUP_VERSION = 1;

const SPECIAL_NEW_TASK = "__new_task__";
const SPECIAL_NEW_GOAL = "__new_goal__";

let currentWeekOffset = 0;
let currentManageSection = null;
let modalConfirmAction = null;

const defaultData = {
  points: 0,
  goals: [],
  tasks: [],
  shortTasks: [],
  milestoneTaskIds: [],
  appCreatedDate: getDateKey(),
  lastWeeklySummaryWeek: null,
  lastBackupDate: null,
  nextBackupReminderDate: getFirstDayOfNextMonthKey(new Date()),
  records: []
};

let appData = loadData();

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function normalizeData(data) {
  const goals = Array.isArray(data?.goals) ? data.goals : [];
  const tasks = Array.isArray(data?.tasks) ? data.tasks : [];
  const shortTasks = Array.isArray(data?.shortTasks) ? data.shortTasks : [];
  const records = Array.isArray(data?.records) ? data.records : [];

  const validTaskIds = new Set(
    tasks.map(task => String(task.id))
  );

  let milestoneTaskIds = [];

  if (Array.isArray(data?.milestoneTaskIds)) {
    milestoneTaskIds = data.milestoneTaskIds
      .filter(id => typeof id === "string" && id)
      .filter(id => validTaskIds.has(String(id)));

  } else if (
    typeof data?.milestoneTaskId === "string" &&
    data.milestoneTaskId &&
    validTaskIds.has(String(data.milestoneTaskId))
  ) {
    milestoneTaskIds = [
      data.milestoneTaskId
    ];
  }

  const earliestRecordDate =
    records
      .map(record => record?.date)
      .filter(date => isValidDateKey(date))
      .sort()[0] ||
    null;

  return {
    points:
      typeof data?.points === "number" &&
      Number.isFinite(data.points)
        ? data.points
        : 0,

    goals,
    tasks,
    shortTasks,
    milestoneTaskIds,

    appCreatedDate:
      isValidDateKey(data?.appCreatedDate)
        ? data.appCreatedDate
        : earliestRecordDate ||
          getDateKey(),

    lastWeeklySummaryWeek:
      isValidDateKey(data?.lastWeeklySummaryWeek)
        ? data.lastWeeklySummaryWeek
        : null,

    lastBackupDate:
      isValidDateKey(data?.lastBackupDate)
        ? data.lastBackupDate
        : null,

    nextBackupReminderDate:
      isValidDateKey(data?.nextBackupReminderDate)
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
   日期
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

  return `${year}-${month}-${day}`;
}

function getYesterdayKey() {
  const date =
    new Date();

  date.setDate(
    date.getDate() - 1
  );

  return getDateKey(
    date
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
    parts.length !== 3
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
    typeof value !== "string" ||
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
    ) === value
  );
}

function getFirstDayOfNextMonthKey(
  date = new Date()
) {
  return getDateKey(
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      1
    )
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

  document
    .getElementById(
      `page-${pageName}`
    )
    ?.classList.add(
      "active"
    );

  document
    .querySelector(
      `.nav-button[data-page="${pageName}"]`
    )
    ?.classList.add(
      "active"
    );

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
      () =>
        switchPage(
          button.dataset.page
        )
    );
  }
);


/* =====================================================
   設定頁摺疊
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
        name,
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
        name;

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

function setupManageAccordion() {
  Object.entries(
    manageAccordionSections
  ).forEach(
    (
      [
        name,
        section
      ]
    ) => {
      document
        .getElementById(
          section.toggleId
        )
        ?.addEventListener(
          "click",
          () => {
            currentManageSection =
              currentManageSection ===
              name
                ? null
                : name;

            renderManageAccordion();
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

modalCancelButton?.addEventListener(
  "click",
  closeModal
);

modalConfirmButton?.addEventListener(
  "click",
  () => {
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

appModal?.addEventListener(
  "click",
  event => {
    if (
      event.target ===
      appModal
    ) {
      closeModal();
    }
  }
);

window.addEventListener(
  "keydown",
  event => {
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
   點數
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
   今日功績
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
      Number(
        record.delta
      ) === 1 &&
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

  const button =
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

  if (button) {
    button.hidden =
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

  const button =
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

  if (button) {
    button.hidden =
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

document
  .getElementById(
    "openAchievementFormButton"
  )
  ?.addEventListener(
    "click",
    openAchievementForm
  );

document
  .getElementById(
    "cancelAchievementButton"
  )
  ?.addEventListener(
    "click",
    closeAchievementForm
  );

document
  .getElementById(
    "addAchievementButton"
  )
  ?.addEventListener(
    "click",
    addAchievement
  );

document
  .getElementById(
    "achievementInput"
  )
  ?.addEventListener(
    "keydown",
    event => {
      if (
        event.key ===
        "Enter"
      ) {
        event.preventDefault();

        addAchievement();
      }
    }
  );


/* =====================================================
   獎勵
===================================================== */

function renderGoals() {
  const list =
    document.getElementById(
      "goalList"
    );

  if (!list) {
    return;
  }

  list.innerHTML =
    "";

  const goals =
    [...appData.goals].sort(
      (a, b) =>
        a.points -
        b.points
    );

  if (
    goals.length ===
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

    list.appendChild(
      empty
    );

    return;
  }

  goals.forEach(
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
        () =>
          redeemGoal(
            goal.id
          )
      );

      right.append(
        points,
        button
      );

      item.append(
        name,
        right
      );

      list.appendChild(
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

  if (
    !confirm(
      `確定要使用 ${goal.points} 點兌換「${goal.name}」嗎？`
    )
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

  openModal({
    title:
      "撤銷",

    message:
      `${rewardName}\n` +
      `${rewardPoints} 點\n\n` +
      "點數將退還\n" +
      "此獎勵將重新開放兌換",

    cancelText:
      "再緩緩",

    confirmText:
      "確認",

    onConfirm:
      () => {
        const latestRecord =
          appData.records.find(
            item =>
              item.id ===
              recordId
          );

        if (
          !latestRecord ||
          latestRecord.type !==
            "redeem"
        ) {
          return;
        }

        appData.points +=
          rewardPoints;

        const exists =
          latestRecord.goalId
            ? appData.goals.some(
                goal =>
                  goal.id ===
                  latestRecord.goalId
              )
            : appData.goals.some(
                goal =>
                  goal.name ===
                    rewardName &&
                  goal.points ===
                    rewardPoints
              );

        if (!exists) {
          appData.goals.push({
            id:
              latestRecord.goalId ||
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
  });
}


/* =====================================================
   固定加分事項
===================================================== */

function renderTasks() {
  const list =
    document.getElementById(
      "taskList"
    );

  if (!list) {
    return;
  }

  list.innerHTML =
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

    list.appendChild(
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

      button.append(
        name,
        points
      );

      button.addEventListener(
        "click",
        () =>
          addPoint(
            task
          )
      );

      list.appendChild(
        button
      );
    }
  );
}

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
   里程碑
===================================================== */

function getMilestoneTasks() {
  const selected =
    new Set(
      Array.isArray(
        appData.milestoneTaskIds
      )
        ? appData.milestoneTaskIds
        : []
    );

  return appData.tasks.filter(
    task =>
      selected.has(
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
      const amount =
        Number(
          record.delta
        );

      if (
        record.type !==
          "task" ||
        record.undone ===
          true ||
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
        ? total +
          amount
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

      row.append(
        name,
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

  const selected =
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
        selected.has(
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
        () =>
          setMilestoneTaskSelected(
            task.id,
            checkbox.checked
          )
      );

      label.append(
        checkbox,
        box,
        name
      );

      checklist.appendChild(
        label
      );
    }
  );
}


/* =====================================================
   未完待續
===================================================== */

function renderCarryoverShortTasks() {
  const section =
    document.getElementById(
      "carryoverTaskSection"
    );

  const list =
    document.getElementById(
      "carryoverTaskList"
    );

  if (
    !section ||
    !list
  ) {
    return;
  }

  const today =
    getDateKey();

  const tasks =
    [...appData.shortTasks]
      .filter(
        task =>
          task.date <
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

  section.hidden =
    false;

  tasks.forEach(
    task => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "carryover-task-item";

      const name =
        document.createElement(
          "div"
        );

      name.className =
        "carryover-task-name";

      name.textContent =
        task.name;

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "carryover-task-actions";

      const continueButton =
        document.createElement(
          "button"
        );

      continueButton.type =
        "button";

      continueButton.className =
        "carryover-task-continue";

      continueButton.textContent =
        "今天繼續";

      continueButton.addEventListener(
        "click",
        () =>
          continueShortTaskToday(
            task.id
          )
      );

      const divider =
        document.createElement(
          "span"
        );

      divider.className =
        "carryover-task-divider";

      divider.textContent =
        "·";

      const dropButton =
        document.createElement(
          "button"
        );

      dropButton.type =
        "button";

      dropButton.className =
        "carryover-task-drop";

      dropButton.textContent =
        "放下";

      dropButton.addEventListener(
        "click",
        () =>
          dropCarryoverShortTask(
            task.id
          )
      );

      actions.append(
        continueButton,
        divider,
        dropButton
      );

      item.append(
        name,
        actions
      );

      list.appendChild(
        item
      );
    }
  );
}

function continueShortTaskToday(
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

  task.date =
    getDateKey();

  saveData();

  renderAll();
}

function dropCarryoverShortTask(
  taskId
) {
  const exists =
    appData.shortTasks.some(
      item =>
        item.id ===
        taskId
    );

  if (!exists) {
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


/* =====================================================
   今天的短期任務
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

  const tasks =
    appData.shortTasks.filter(
      task =>
        task.date ===
        today
    );

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

  section.hidden =
    false;

  tasks.forEach(
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

      button.append(
        name,
        points
      );

      button.addEventListener(
        "click",
        () =>
          completeShortTask(
            task.id
          )
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

  const records =
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
        Number(
          record.delta
        ) === 1 &&
        record.undone !==
          true
    );

  const completed =
    Math.min(
      records.length,
      5
    );

  document
    .querySelectorAll(
      ".progress-light"
    )
    .forEach(
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
   撤銷
===================================================== */

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

  if (
    ![
      "task",
      "shortTask",
      "achievement"
    ].includes(
      record.type
    ) ||
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {
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

  let message =
    `${record.name}\n` +
    `+${amount} 點\n\n` +
    "總點數將自動更新";

  const shortTaskDate =
    record.shortTaskDate ||
    record.date;

  if (
    record.type ===
      "shortTask" &&
    shortTaskDate ===
      getDateKey()
  ) {
    message +=
      "\n此任務將重新開放挑戰";
  }

  openModal({
    title:
      "撤銷",

    message,

    cancelText:
      "再緩緩",

    confirmText:
      "確認",

    onConfirm:
      () => {
        const latestRecord =
          appData.records.find(
            item =>
              item.id ===
              recordId
          );

        if (!latestRecord) {
          return;
        }

        const latestAmount =
          Number(
            latestRecord.delta
          );

        if (
          !Number.isFinite(
            latestAmount
          ) ||
          latestAmount <= 0
        ) {
          return;
        }

        if (
          appData.points <
          latestAmount
        ) {
          alert(
            `目前可用點數不足 ${latestAmount} 點。\n\n這筆點數可能已經被兌換使用，請先撤銷相關兌換後再撤銷這筆加分。`
          );

          return;
        }

        reversePointRecord(
          latestRecord
        );
      }
  });
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
    amount <= 0
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

      const exists =
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

      if (!exists) {
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
    appData.goals.length
      ? "請選擇獎勵"
      : "目前沒有獎勵";

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

function deleteSelectedGoal() {
  const select =
    document.getElementById(
      "goalDeleteSelect"
    );

  if (
    !select?.value
  ) {
    alert(
      "請先選擇要刪除的獎勵。"
    );

    return;
  }

  const goal =
    appData.goals.find(
      item =>
        item.id ===
        select.value
    );

  if (!goal) {
    return;
  }

  if (
    !confirm(
      `確定要刪除「${goal.name}」嗎？\n\n過去紀錄不會受到影響。`
    )
  ) {
    return;
  }

  appData.goals =
    appData.goals.filter(
      item =>
        item.id !==
        goal.id
    );

  saveData();

  renderAll();
}

document
  .getElementById(
    "addGoalButton"
  )
  ?.addEventListener(
    "click",
    addGoal
  );

document
  .getElementById(
    "goalDeleteSelect"
  )
  ?.addEventListener(
    "change",
    event => {
      const button =
        document.getElementById(
          "deleteGoalButton"
        );

      if (button) {
        button.disabled =
          !event.target.value;
      }
    }
  );

document
  .getElementById(
    "deleteGoalButton"
  )
  ?.addEventListener(
    "click",
    deleteSelectedGoal
  );


/* =====================================================
   設定：加分事項
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
    appData.tasks.length
      ? "請選擇加分事項"
      : "目前沒有加分事項";

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

function deleteSelectedTask() {
  const select =
    document.getElementById(
      "taskDeleteSelect"
    );

  if (
    !select?.value
  ) {
    alert(
      "請先選擇要刪除的加分事項。"
    );

    return;
  }

  const task =
    appData.tasks.find(
      item =>
        item.id ===
        select.value
    );

  if (!task) {
    return;
  }

  if (
    !confirm(
      `確定要刪除「${task.name}」嗎？\n\n過去紀錄不會受到影響。`
    )
  ) {
    return;
  }

  appData.tasks =
    appData.tasks.filter(
      item =>
        item.id !==
        task.id
    );

  appData.milestoneTaskIds =
    (
      appData.milestoneTaskIds ||
      []
    ).filter(
      id =>
        id !==
        task.id
    );

  saveData();

  renderAll();
}

document
  .getElementById(
    "addTaskButton"
  )
  ?.addEventListener(
    "click",
    addTask
  );

document
  .getElementById(
    "taskDeleteSelect"
  )
  ?.addEventListener(
    "change",
    event => {
      const button =
        document.getElementById(
          "deleteTaskButton"
        );

      if (button) {
        button.disabled =
          !event.target.value;
      }
    }
  );

document
  .getElementById(
    "deleteTaskButton"
  )
  ?.addEventListener(
    "click",
    deleteSelectedTask
  );


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

  if (
    date <
    getDateKey()
  ) {
    alert(
      "短期任務不能設定在已經過去的日期。"
    );

    return;
  }

  if (
    appData.shortTasks.some(
      task =>
        task.name ===
          name &&
        task.date ===
          date
    )
  ) {
    alert(
      "這一天已經有相同的短期任務。"
    );

    return;
  }

  appData.shortTasks.push({
    id:
      createId(),

    name,

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
    futureTasks.length
      ? "請選擇短期任務"
      : "目前沒有已安排任務";

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

function deleteSelectedShortTask() {
  const select =
    document.getElementById(
      "shortTaskDeleteSelect"
    );

  if (
    !select?.value
  ) {
    alert(
      "請先選擇要刪除的短期任務。"
    );

    return;
  }

  const task =
    appData.shortTasks.find(
      item =>
        item.id ===
        select.value
    );

  if (!task) {
    return;
  }

  if (
    !confirm(
      `確定要刪除「${formatDateKeyShort(task.date)}　${task.name}」嗎？\n\n不會影響點數或過去紀錄。`
    )
  ) {
    return;
  }

  appData.shortTasks =
    appData.shortTasks.filter(
      item =>
        item.id !==
        task.id
    );

  saveData();

  renderAll();
}

document
  .getElementById(
    "addShortTaskButton"
  )
  ?.addEventListener(
    "click",
    addShortTask
  );

document
  .getElementById(
    "shortTaskDeleteSelect"
  )
  ?.addEventListener(
    "change",
    event => {
      const button =
        document.getElementById(
          "deleteShortTaskButton"
        );

      if (button) {
        button.disabled =
          !event.target.value;
      }
    }
  );

document
  .getElementById(
    "deleteShortTaskButton"
  )
  ?.addEventListener(
    "click",
    deleteSelectedShortTask
  );


/* =====================================================
   補登
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
      appData.tasks.length
        ? "選擇加分事項"
        : "目前沒有加分事項";

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
      appData.goals.length
        ? "選擇獎勵"
        : "目前沒有獎勵";

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
      () =>
        goToManageSection(
          "task",
          "taskName"
        )
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
      () =>
        goToManageSection(
          "goal",
          "goalName"
        )
  });
}

function validateBackfillDate(
  date
) {
  if (!date) {
    alert(
      "請選擇補登日期。"
    );

    return false;
  }

  if (
    date >=
    getDateKey()
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

  if (
    !select.value
  ) {
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
    amount <= 0
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
      () =>
        commitBackfillPoints(
          task.id,
          amount,
          date
        )
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

  if (
    !select.value
  ) {
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
      () =>
        commitBackfillRedeem(
          goal.id,
          date
        )
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

document
  .getElementById(
    "backfillTaskSelect"
  )
  ?.addEventListener(
    "change",
    event => {
      if (
        event.target.value ===
        SPECIAL_NEW_TASK
      ) {
        askToCreateTask();
      }
    }
  );

document
  .getElementById(
    "backfillGoalSelect"
  )
  ?.addEventListener(
    "change",
    event => {
      if (
        event.target.value ===
        SPECIAL_NEW_GOAL
      ) {
        askToCreateGoal();
      }
    }
  );

document
  .getElementById(
    "backfillTaskButton"
  )
  ?.addEventListener(
    "click",
    requestBackfillPoints
  );

document
  .getElementById(
    "backfillGoalButton"
  )
  ?.addEventListener(
    "click",
    requestBackfillRedeem
  );


/* =====================================================
   戰績
===================================================== */

document
  .getElementById(
    "previousWeek"
  )
  ?.addEventListener(
    "click",
    () => {
      currentWeekOffset -=
        1;

      renderWeeklyRecord();
    }
  );

document
  .getElementById(
    "nextWeek"
  )
  ?.addEventListener(
    "click",
    () => {
      currentWeekOffset +=
        1;

      renderWeeklyRecord();
    }
  );

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

  const weekdays = [
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
    const dateKey =
      getDateKey(
        addDays(
          monday,
          i
        )
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
      weekdays[i];

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
            Number(
              record.delta
            ) > 0
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
            const actions =
              document.createElement(
                "div"
              );

            actions.className =
              "record-actions";

            const undo =
              document.createElement(
                "button"
              );

            undo.className =
              "undo-record-button";

            undo.textContent =
              "撤銷";

            undo.addEventListener(
              "click",
              () => {
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

            actions.append(
              delta,
              undo
            );

            item.appendChild(
              actions
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
   下載與備份
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

  appData.lastBackupDate =
    getDateKey();

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
      startDate,
      endDate
    },

    data:
      appData
  };

  downloadFile(
    JSON.stringify(
      backup,
      null,
      2
    ),

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
  return (
    !!data &&
    typeof data ===
      "object" &&
    !Array.isArray(
      data
    ) &&
    typeof data.points ===
      "number" &&
    Number.isFinite(
      data.points
    ) &&
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
    const backup =
      JSON.parse(
        await file.text()
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
      const parsed =
        new Date(
          backup.exportedAt
        );

      if (
        !Number.isNaN(
          parsed.getTime()
        )
      ) {
        backupDate =
          parsed.toLocaleString(
            "zh-TW"
          );
      }
    }

    if (
      !confirm(
        `確定要匯入這份備份嗎？\n\n` +
        `備份日期：${backupDate}\n` +
        `目前點數：${backup.data.points} 點\n` +
        `紀錄：${backup.data.records.length} 筆\n\n` +
        `匯入後會取代目前裝置中的點數、設定與紀錄。`
      )
    ) {
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
  const records =
    appData.records.filter(
      record =>
        record.type !==
          "undo" &&
        record.undone !==
          true
    );

  if (
    records.length ===
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

  records.forEach(
    record => {
      const date =
        new Date(
          `${record.date}T00:00:00`
        );

      rows.push([
        record.date.replaceAll(
          "-",
          "/"
        ),

        weekdayNames[
          date.getDay()
        ],

        record.name,

        Number(
          record.delta
        ) > 0
          ? `+${record.delta}`
          : record.delta
      ]);
    }
  );

  const csv =
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
    csv,

    "text/csv;charset=utf-8;",

    `我的點數_數據_${getDateKey()}.csv`
  );
}

document
  .getElementById(
    "exportBackupButton"
  )
  ?.addEventListener(
    "click",
    () =>
      exportBackup()
  );

const importBackupButton =
  document.getElementById(
    "importBackupButton"
  );

const importBackupInput =
  document.getElementById(
    "importBackupInput"
  );

if (
  importBackupButton &&
  importBackupInput
) {
  importBackupButton.addEventListener(
    "click",
    () => {
      importBackupInput.value =
        "";

      importBackupInput.click();
    }
  );

  importBackupInput.addEventListener(
    "change",
    () =>
      importBackupFile(
        importBackupInput.files?.[0]
      )
  );
}

document
  .getElementById(
    "downloadDataButton"
  )
  ?.addEventListener(
    "click",
    downloadData
  );


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

  const start =
    getDateKey(
      addDays(
        currentMonday,
        -7
      )
    );

  const end =
    getDateKey(
      addDays(
        currentMonday,
        -1
      )
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
        amount <= 0
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
      name,
      count
    })
  );
}

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
          amount > 0
        )
          ? total +
            amount
          : total;
      },
      0
    );

  const achievements =
    records.filter(
      record =>
        record.type ===
          "achievement" &&
        Number(
          record.delta
        ) > 0 &&
        record.undone !==
          true
    );

  const taskSummary =
    buildWeeklyTaskSummary(
      records
    );

  const shortTasks =
    records.filter(
      record =>
        record.type ===
          "shortTask" &&
        Number(
          record.delta
        ) > 0 &&
        record.undone !==
          true
    );

  weeklySummaryEarned.textContent =
    `${earnedPoints} 點`;

  weeklySummaryAchievements.innerHTML =
    "";

  weeklySummaryAchievementSection.hidden =
    achievements.length ===
    0;

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

  weeklySummaryTasks.innerHTML =
    "";

  weeklySummaryTaskSection.hidden =
    taskSummary.length ===
    0;

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

      row.append(
        name,
        count
      );

      weeklySummaryTasks.appendChild(
        row
      );
    }
  );

  weeklySummaryShortTasks.innerHTML =
    "";

  weeklySummaryShortTaskSection.hidden =
    shortTasks.length ===
    0;

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

  weeklySummaryModal.hidden =
    false;

  document.body.classList.add(
    "modal-open"
  );

  weeklySummaryButton?.focus();

  return true;
}

function closeWeeklySummary() {
  if (!weeklySummaryModal) {
    return;
  }

  weeklySummaryModal.hidden =
    true;

  document.body.classList.remove(
    "modal-open"
  );

  checkBackupReminder();
}

function checkWeeklySummary() {
  const weekKey =
    getCurrentWeekKey();

  if (
    appData.lastWeeklySummaryWeek ===
    weekKey
  ) {
    return false;
  }

  const records =
    getPreviousWeekRecords();

  appData.lastWeeklySummaryWeek =
    weekKey;

  saveData();

  if (
    records.length ===
    0
  ) {
    return false;
  }

  return openWeeklySummary(
    records
  );
}

weeklySummaryButton?.addEventListener(
  "click",
  closeWeeklySummary
);


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
  if (!lastBackupStatus) {
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

  backupReminderRange.textContent =
    `${formatDateForDisplay(getBackupStartDate())} ～ ${formatDateForDisplay(getYesterdayKey())}`;

  backupReminderLastDate.textContent =
    appData.lastBackupDate
      ? `上次備份：${formatDateForDisplay(appData.lastBackupDate)}`
      : "上次備份：尚未備份";

  backupReminderModal.hidden =
    false;

  document.body.classList.add(
    "modal-open"
  );

  backupReminderNowButton?.focus();

  return true;
}

function closeBackupReminder() {
  if (!backupReminderModal) {
    return;
  }

  backupReminderModal.hidden =
    true;

  document.body.classList.remove(
    "modal-open"
  );
}

function postponeBackupReminder() {
  appData.nextBackupReminderDate =
    getDateKey(
      addDays(
        new Date(),
        7
      )
    );

  saveData();

  closeBackupReminder();
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

backupReminderLaterButton?.addEventListener(
  "click",
  postponeBackupReminder
);

backupReminderNowButton?.addEventListener(
  "click",
  () =>
    exportBackup({
      throughYesterday:
        true,

      fromReminder:
        true
    })
);


/* =====================================================
   PWA
===================================================== */

if (
  "serviceWorker" in
  navigator
) {
  window.addEventListener(
    "load",
    () => {
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
   全部重新整理
===================================================== */

function renderAll() {
  renderPoints();

  renderAchievements();

  renderGoals();

  renderTasks();

  renderCarryoverShortTasks();

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