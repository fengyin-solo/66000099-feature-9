<template>
  <div style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px">
    <!-- 工具栏 -->
    <div style="background:#fff;padding:10px 12px;border-radius:8px;border:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center;gap:8px">
      <span style="font-size:12px;color:#666">
        巡检计划
        <span style="color:#999">（{{ activePlanCount }} 个进行中 / {{ planCount }} 个总计）</span>
      </span>
      <span style="display:flex;gap:6px">
        <button @click="store.fetchInspectionPlans()" :disabled="store.inspectionPlansLoading"
          style="padding:4px 10px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:11px;color:#666">
          🔄 刷新
        </button>
        <button v-if="store.devices.length > 0" @click="toggleCreateForm"
          style="padding:4px 10px;border-radius:6px;border:1px solid #1976d2;background:#e3f2fd;cursor:pointer;font-size:11px;color:#1976d2;font-weight:600">
          ➕ 新建计划
        </button>
      </span>
    </div>

    <!-- 新建计划表单 -->
    <div v-if="showCreateForm" style="background:#fff;padding:12px;border-radius:8px;border:1px solid #1976d2;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:13px;font-weight:600;color:#333">📝 新建健康巡检计划</span>
        <button @click="toggleCreateForm" style="background:none;border:none;cursor:pointer;color:#999;font-size:16px">×</button>
      </div>
      <input v-model="newPlanName" type="text" placeholder="计划名称，例如：机房周巡检"
        style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:12px;outline:none" />
      <input v-model="newPlanDesc" type="text" placeholder="计划说明（可选）"
        style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:12px;outline:none" />
      <div>
        <div style="font-size:11px;color:#888;margin-bottom:6px">巡检阶段</div>
        <div style="display:flex;gap:6px">
          <button @click="newPlanStage = 'routine'"
            :style="stageButtonStyle(newPlanStage === 'routine')">
            🔁 常规巡检（&lt;60 分提醒）
          </button>
          <button @click="newPlanStage = 'focused'"
            :style="stageButtonStyle(newPlanStage === 'focused')">
            🎯 重点巡检（&lt;80 分提醒）
          </button>
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:#888;margin-bottom:6px">
          负责设备（已选 {{ newDeviceIds.length }} 台，至少选择 1 台）
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <button v-for="device in store.devices" :key="device.id"
            @click="toggleNewDevice(device.id)"
            :style="deviceChipStyle(newDeviceIds.includes(device.id))">
            {{ device.name }}
          </button>
        </div>
      </div>
      <div v-if="createError" style="font-size:11px;color:#c62828">⚠️ {{ createError }}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button @click="toggleCreateForm"
          style="padding:6px 14px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:12px;color:#666">
          取消
        </button>
        <button @click="submitCreate"
          style="padding:6px 14px;border-radius:6px;border:1px solid #2e7d32;background:#e8f5e9;cursor:pointer;font-size:12px;color:#2e7d32;font-weight:600">
          创建并启动
        </button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="store.inspectionPlansLoading"
      style="text-align:center;padding:48px 20px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;color:#888;font-size:13px">
      <div style="font-size:28px;margin-bottom:8px">⏳</div>
      <div>巡检计划加载中…</div>
    </div>

    <!-- 加载失败：空态 + 重试 -->
    <div v-else-if="store.inspectionPlansError"
      style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px solid #ffcdd2;color:#666;font-size:13px">
      <div style="font-size:32px;margin-bottom:8px">📡</div>
      <div style="font-weight:600;color:#c62828;margin-bottom:4px">巡检计划加载失败</div>
      <div style="font-size:12px;color:#999;margin-bottom:14px">{{ store.inspectionPlansError }}</div>
      <button @click="store.fetchInspectionPlans()"
        style="padding:6px 18px;border-radius:6px;border:1px solid #1976d2;background:#e3f2fd;color:#1976d2;cursor:pointer;font-size:12px;font-weight:600">
        🔄 重试
      </button>
    </div>

    <!-- 全局无设备：空态 -->
    <div v-else-if="store.devices.length === 0"
      style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;color:#999;font-size:13px">
      <div style="font-size:32px;margin-bottom:8px">📭</div>
      <div>暂无设备，无法建立巡检计划</div>
      <div style="font-size:11px;margin-top:6px">请先在设备面板注册设备后再创建计划</div>
    </div>

    <!-- 无计划：空态 -->
    <div v-else-if="store.inspectionPlans.length === 0"
      style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;color:#999;font-size:13px">
      <div style="font-size:32px;margin-bottom:8px">🗂️</div>
      <div>暂无巡检计划</div>
      <div style="font-size:11px;margin:6px 0 14px">建立计划后，管理员可分组巡检设备健康并跟踪在线率</div>
      <button @click="toggleCreateForm"
        style="padding:6px 18px;border-radius:6px;border:1px solid #2e7d32;background:#e8f5e9;color:#2e7d32;cursor:pointer;font-size:12px;font-weight:600">
        ➕ 新建巡检计划
      </button>
    </div>

    <template v-else>
      <!-- 巡检提醒（暂停中的计划不参与） -->
      <div style="background:#fff;padding:10px 12px;border-radius:8px;border:1px solid #ffe0b2">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:12px;font-weight:600;color:#e65100">🔔 巡检提醒</span>
          <span :style="{ fontSize:'11px', fontWeight:600, color: store.inspectionReminders.length > 0 ? '#c62828' : '#2e7d32' }">
            {{ store.inspectionReminders.length > 0 ? store.inspectionReminders.length + ' 台待巡检' : '暂无待提醒设备' }}
          </span>
        </div>
        <div v-if="store.inspectionReminders.length === 0" style="font-size:11px;color:#999">
          ✅ 进行中的计划内设备健康状况良好，已暂停的计划不参与提醒
        </div>
        <div v-else style="display:flex;flex-direction:column;gap:6px">
          <div v-for="reminder in store.inspectionReminders" :key="reminder.planId + ':' + reminder.health.deviceId"
            @click="$emit('view-device', reminder.health)"
            style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;background:#fff8e1;cursor:pointer;font-size:12px">
            <span :style="{ fontSize:'10px', padding:'1px 6px', borderRadius:'8px', flexShrink:0,
              background: getHealthScoreBgColor(reminder.health.healthScore),
              color: getHealthScoreTextColor(reminder.health.healthScore) }">
              {{ reminder.health.healthScore }}分
            </span>
            <span style="font-weight:600;color:#333;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ reminder.health.deviceName }}
            </span>
            <span style="font-size:10px;color:#e65100;background:#fff3e0;padding:1px 6px;border-radius:8px;flexShrink:0">
              {{ reminder.planName }}
            </span>
          </div>
        </div>
      </div>

      <!-- 计划卡片 -->
      <div v-for="plan in store.inspectionPlans" :key="plan.id"
        style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0;display:flex;flex-direction:column;gap:10px"
        :style="{ borderColor: plan.status === 'paused' ? '#cfd8dc' : '#e0e0e0', opacity: plan.status === 'paused' ? 0.92 : 1 }">
        <!-- 卡片头 -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
          <div style="min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <span style="font-weight:600;font-size:13px;color:#333">{{ plan.name }}</span>
              <span :style="statusBadgeStyle(plan.status)">
                {{ plan.status === 'active' ? '🟢 进行中' : '⏸️ 已暂停' }}
              </span>
            </div>
            <div v-if="plan.description" style="font-size:11px;color:#999;margin-top:3px">{{ plan.description }}</div>
            <div v-if="plan.status === 'paused' && plan.pausedAt" style="font-size:10px;color:#90a4ae;margin-top:3px">
              暂停于 {{ formatDateTime(plan.pausedAt) }}，保留历史健康评分与在线率
            </div>
          </div>
          <button v-if="plan.status === 'active'" @click="store.pauseInspectionPlan(plan.id)"
            style="padding:4px 10px;border-radius:6px;border:1px solid #ffa726;background:#fff3e0;color:#e65100;cursor:pointer;font-size:11px;font-weight:600;flexShrink:0">
            ⏸️ 暂停
          </button>
          <button v-else @click="store.resumeInspectionPlan(plan.id)"
            style="padding:4px 10px;border-radius:6px;border:1px solid #2e7d32;background:#e8f5e9;color:#2e7d32;cursor:pointer;font-size:11px;font-weight:600;flexShrink:0">
            ▶️ 恢复
          </button>
        </div>

        <!-- 综合评分 -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
          <div style="background:#fafafa;padding:8px;border-radius:6px;text-align:center">
            <div style="font-size:10px;color:#888">综合评分</div>
            <div v-if="statsOf(plan).deviceCount > 0"
              :style="{ fontSize:'18px', fontWeight:700, color: getHealthScoreTextColor(statsOf(plan).avgHealthScore) }">
              {{ statsOf(plan).avgHealthScore }}
            </div>
            <div v-else style="font-size:18px;font-weight:700;color:#bbb">—</div>
          </div>
          <div style="background:#fafafa;padding:8px;border-radius:6px;text-align:center">
            <div style="font-size:10px;color:#888">平均在线率</div>
            <div v-if="statsOf(plan).deviceCount > 0" style="font-size:18px;font-weight:700;color:#1565c0">
              {{ statsOf(plan).avgOnlineRate }}%
            </div>
            <div v-else style="font-size:18px;font-weight:700;color:#bbb">—</div>
          </div>
          <div style="background:#fafafa;padding:8px;border-radius:6px;text-align:center">
            <div style="font-size:10px;color:#888">待提醒</div>
            <div :style="{ fontSize:'18px', fontWeight:700, color: statsOf(plan).reminderCount > 0 ? '#c62828' : '#2e7d32' }">
              {{ plan.status === 'paused' ? '—' : statsOf(plan).reminderCount }}
            </div>
          </div>
        </div>
        <div v-if="statsOf(plan).fromSnapshot" style="font-size:10px;color:#90a4ae;margin-top:-4px">
          📌 以上为暂停时保留的历史数据
        </div>

        <!-- 阶段切换 -->
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:#888;flex-shrink:0">巡检阶段</span>
          <div style="display:flex;gap:6px;flex:1">
            <button @click="store.setInspectionStage(plan.id, 'routine')"
              :style="stageButtonStyle(plan.stage === 'routine')">
              🔁 常规
            </button>
            <button @click="store.setInspectionStage(plan.id, 'focused')"
              :style="stageButtonStyle(plan.stage === 'focused')">
              🎯 重点
            </button>
          </div>
        </div>

        <!-- 负责设备 -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:11px;color:#888">
              负责设备（{{ statsOf(plan).deviceCount }} 台）
            </span>
            <button v-if="editingPlanId !== plan.id" @click="startEdit(plan)"
              style="padding:2px 8px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:11px;color:#1976d2">
              ✏️ 调整设备
            </button>
            <span v-else style="display:flex;gap:6px">
              <button @click="cancelEdit"
                style="padding:2px 8px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:11px;color:#666">
                取消
              </button>
              <button @click="saveEdit(plan)"
                style="padding:2px 8px;border-radius:6px;border:1px solid #2e7d32;background:#e8f5e9;cursor:pointer;font-size:11px;color:#2e7d32;font-weight:600">
                保存
              </button>
            </span>
          </div>

          <!-- 只读设备列表 -->
          <div v-if="editingPlanId !== plan.id">
            <div v-if="plan.deviceIds.length === 0" style="font-size:11px;color:#999;padding:6px 0">
              暂无负责设备，请点击「调整设备」添加
            </div>
            <div v-else style="display:flex;flex-wrap:wrap;gap:6px">
              <span v-for="deviceId in plan.deviceIds" :key="deviceId"
                @click="handleDeviceClick(deviceId)"
                style="font-size:11px;padding:3px 8px;border-radius:10px;background:#f1f8e9;color:#33691e;cursor:pointer;display:inline-flex;align-items:center;gap:4px">
                {{ store.getDeviceById(deviceId)?.name || '未知设备' }}
                <span :style="{ fontSize:'10px', fontWeight:700, color: deviceScoreColor(deviceId, plan) }">
                  · {{ deviceScoreText(deviceId, plan) }}
                </span>
              </span>
            </div>
          </div>

          <!-- 编辑设备范围 -->
          <div v-else style="display:flex;flex-wrap:wrap;gap:6px">
            <button v-for="device in store.devices" :key="device.id"
              @click="toggleEditDevice(device.id)"
              :style="deviceChipStyle(editDeviceIds.includes(device.id))">
              {{ device.name }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useIotStore } from '../stores/iot';
import type { DeviceHealth, InspectionPlan, InspectionStage } from '../types';

const emit = defineEmits<{
  (e: 'view-device', health: DeviceHealth): void;
}>();

const store = useIotStore();

const showCreateForm = ref(false);
const newPlanName = ref('');
const newPlanDesc = ref('');
const newPlanStage = ref<InspectionStage>('routine');
const newDeviceIds = ref<string[]>([]);
const createError = ref('');

const editingPlanId = ref<string | null>(null);
const editDeviceIds = ref<string[]>([]);

const planCount = () => store.inspectionPlans.length;
const activePlanCount = () => store.inspectionPlans.filter(p => p.status === 'active').length;

function statsOf(plan: InspectionPlan) {
  return store.getPlanStats(plan);
}

function toggleCreateForm() {
  showCreateForm.value = !showCreateForm.value;
  if (showCreateForm.value) {
    newPlanName.value = '';
    newPlanDesc.value = '';
    newPlanStage.value = 'routine';
    newDeviceIds.value = [];
    createError.value = '';
  }
}

function toggleNewDevice(deviceId: string) {
  const idx = newDeviceIds.value.indexOf(deviceId);
  if (idx === -1) {
    newDeviceIds.value.push(deviceId);
  } else {
    newDeviceIds.value.splice(idx, 1);
  }
}

function submitCreate() {
  if (newDeviceIds.value.length === 0) {
    createError.value = '请至少选择一台负责设备';
    return;
  }
  const id = store.createInspectionPlan({
    name: newPlanName.value,
    description: newPlanDesc.value,
    deviceIds: newDeviceIds.value,
    stage: newPlanStage.value
  });
  if (!id) {
    createError.value = '所选设备均不存在，请重新选择';
    return;
  }
  showCreateForm.value = false;
}

function startEdit(plan: InspectionPlan) {
  editingPlanId.value = plan.id;
  editDeviceIds.value = [...plan.deviceIds];
}

function cancelEdit() {
  editingPlanId.value = null;
  editDeviceIds.value = [];
}

function toggleEditDevice(deviceId: string) {
  const idx = editDeviceIds.value.indexOf(deviceId);
  if (idx === -1) {
    editDeviceIds.value.push(deviceId);
  } else {
    editDeviceIds.value.splice(idx, 1);
  }
}

function saveEdit(plan: InspectionPlan) {
  store.setInspectionPlanDevices(plan.id, editDeviceIds.value);
  cancelEdit();
}

function handleDeviceClick(deviceId: string) {
  const health = store.getDeviceHealth(deviceId);
  if (health) emit('view-device', health);
}

/** 暂停中计划显示冻结的历史评分，进行中计划显示实时评分 */
function deviceScoreText(deviceId: string, plan: InspectionPlan): string {
  if (plan.status === 'paused' && plan.frozenSnapshots) {
    const snap = plan.frozenSnapshots.find(s => s.deviceId === deviceId);
    return snap ? `${snap.healthScore}分` : '—';
  }
  const health = store.getDeviceHealth(deviceId);
  return health ? `${health.healthScore}分` : '—';
}

function deviceScoreColor(deviceId: string, plan: InspectionPlan): string {
  if (plan.status === 'paused' && plan.frozenSnapshots) {
    const snap = plan.frozenSnapshots.find(s => s.deviceId === deviceId);
    return snap ? getHealthScoreTextColor(snap.healthScore) : '#bbb';
  }
  const health = store.getDeviceHealth(deviceId);
  return health ? getHealthScoreTextColor(health.healthScore) : '#bbb';
}

function getHealthScoreBgColor(score: number): string {
  if (score >= 70) return '#e8f5e9';
  if (score >= 40) return '#fff3e0';
  return '#ffebee';
}

function getHealthScoreTextColor(score: number): string {
  if (score >= 70) return '#2e7d32';
  if (score >= 40) return '#e65100';
  return '#c62828';
}

function statusBadgeStyle(status: InspectionPlan['status']) {
  return {
    fontSize: '10px',
    padding: '1px 8px',
    borderRadius: '8px',
    fontWeight: 600,
    background: status === 'active' ? '#e8f5e9' : '#eceff1',
    color: status === 'active' ? '#2e7d32' : '#607d8b'
  };
}

function stageButtonStyle(active: boolean) {
  return {
    flex: '1',
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid ' + (active ? '#1976d2' : '#ddd'),
    background: active ? '#e3f2fd' : '#fff',
    color: active ? '#1976d2' : '#999',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: active ? 600 : 400
  };
}

function deviceChipStyle(selected: boolean) {
  return {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '12px',
    border: '1px solid ' + (selected ? '#2e7d32' : '#ddd'),
    background: selected ? '#e8f5e9' : '#fff',
    color: selected ? '#2e7d32' : '#666',
    cursor: 'pointer',
    fontWeight: selected ? 600 : 400
  };
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>
