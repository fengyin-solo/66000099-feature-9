<template>
  <div style="width:420px;padding:16px;overflow:auto;border-left:1px solid #e0e0e0;display:flex;flex-direction:column;height:100vh;box-sizing:border-box;background:#f5f5f5">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-shrink:0">
      <h3 style="margin:0;display:flex;align-items:center;gap:8px;font-size:16px;color:#1b5e20">
        <span style="font-size:20px">🏥</span>
        设备健康诊断
      </h3>
      <span :style="{ padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:600,
        background: getHealthScoreBgColor(store.healthSummary.avgHealthScore),
        color: getHealthScoreTextColor(store.healthSummary.avgHealthScore) }">
        综合评分 {{ store.healthSummary.avgHealthScore }}
      </span>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;flex-shrink:0">
      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:11px;color:#888;margin-bottom:4px">平均在线率</div>
        <div style="font-size:20px;font-weight:700;color:#2e7d32">{{ store.healthSummary.avgOnlineRate }}%</div>
      </div>
      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:11px;color:#888;margin-bottom:4px">平均电量</div>
        <div :style="{ fontSize:'20px', fontWeight:700, color: store.healthSummary.avgBatteryLevel < 30 ? '#e65100' : '#1565c0' }">
          {{ store.healthSummary.avgBatteryLevel }}%
        </div>
      </div>
      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:11px;color:#888;margin-bottom:4px">待处理异常</div>
        <div :style="{ fontSize:'20px', fontWeight:700, color: store.healthSummary.totalAlertCount > 0 ? '#c62828' : '#2e7d32' }">
          {{ store.healthSummary.totalAlertCount }}
        </div>
      </div>
      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:11px;color:#888;margin-bottom:4px">需优先巡检</div>
        <div :style="{ fontSize:'20px', fontWeight:700, color: store.healthSummary.highPriorityCount > 0 ? '#c62828' : '#2e7d32' }">
          {{ store.healthSummary.highPriorityCount + store.healthSummary.mediumPriorityCount }} 台
        </div>
      </div>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:12px;flex-shrink:0">
      <button @click="switchTab('overview')"
        :style="{ flex:1, padding:'8px 4px', borderRadius:'6px', border:'1px solid ' + (activeTab === 'overview' ? '#1976d2' : '#ddd'),
          background: activeTab === 'overview' ? '#e3f2fd' : '#fff', color: activeTab === 'overview' ? '#1976d2' : '#666',
          cursor:'pointer', fontSize:'12px', fontWeight:500 }">
        📊 趋势分析
      </button>
      <button @click="switchTab('priority')"
        :style="{ flex:1, padding:'8px 4px', borderRadius:'6px', border:'1px solid ' + (activeTab === 'priority' ? '#1976d2' : '#ddd'),
          background: activeTab === 'priority' ? '#e3f2fd' : '#fff', color: activeTab === 'priority' ? '#1976d2' : '#666',
          cursor:'pointer', fontSize:'12px', fontWeight:500 }">
        ⚠️ 优先巡检
      </button>
      <button @click="switchTab('records')"
        :style="{ flex:1, padding:'8px 4px', borderRadius:'6px', border:'1px solid ' + (activeTab === 'records' ? '#1976d2' : '#ddd'),
          background: activeTab === 'records' ? '#e3f2fd' : '#fff', color: activeTab === 'records' ? '#1976d2' : '#666',
          cursor:'pointer', fontSize:'12px', fontWeight:500 }">
        📋 异常记录
      </button>
      <button @click="switchTab('plans')"
        :style="{ position:'relative', flex:1, padding:'8px 4px', borderRadius:'6px', border:'1px solid ' + (activeTab === 'plans' ? '#1976d2' : '#ddd'),
          background: activeTab === 'plans' ? '#e3f2fd' : '#fff', color: activeTab === 'plans' ? '#1976d2' : '#666',
          cursor:'pointer', fontSize:'12px', fontWeight:500 }">
        🗂️ 巡检计划
        <span v-if="store.totalPlanReminders > 0"
          :style="{ position:'absolute', top:'-6px', right:'2px', minWidth:'16px', height:'16px',
            borderRadius:'8px', background:'#e53935', color:'#fff', fontSize:'10px',
            display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700,
            padding:'0 4px', lineHeight:'1' }">
          {{ store.totalPlanReminders > 99 ? '99+' : store.totalPlanReminders }}
        </span>
      </button>
    </div>

    <div v-if="activeTab === 'overview'" style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:12px">
      <div v-if="selectedDevice" style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:14px">📱</span>
            <span style="font-weight:600;font-size:13px">{{ selectedDevice.deviceName }}</span>
          </div>
          <button @click="selectedDevice = null" style="background:none;border:none;cursor:pointer;color:#999;font-size:16px">×</button>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:10px">
          <div style="flex:1">
            <div style="font-size:10px;color:#888;margin-bottom:2px">健康评分</div>
            <div :style="{ fontSize:'18px', fontWeight:700, color: getHealthScoreTextColor(selectedDevice.healthScore) }">
              {{ selectedDevice.healthScore }}
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:10px;color:#888;margin-bottom:2px">健康趋势</div>
            <div :style="{ fontSize:'14px', fontWeight:600, color: getTrendColor(selectedDevice.healthTrend) }">
              {{ getTrendIcon(selectedDevice.healthTrend) }} {{ getTrendText(selectedDevice.healthTrend) }}
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:10px;color:#888;margin-bottom:2px">在线时长</div>
            <div style="font-size:14px;font-weight:600;color:#1565c0">{{ selectedDevice.onlineHours }}h</div>
          </div>
        </div>
        <div v-if="selectedDevice.recommendations.length > 0" style="margin-top:8px">
          <div style="font-size:11px;color:#e65100;font-weight:600;margin-bottom:4px">💡 巡检建议</div>
          <div v-for="(rec, idx) in selectedDevice.recommendations" :key="idx"
            style="font-size:11px;color:#666;padding:4px 8px;background:#fff8e1;border-radius:4px;margin-bottom:4px">
            {{ rec }}
          </div>
        </div>
      </div>

      <div v-else style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:12px;color:#666;text-align:center">
          👇 点击下方设备查看详细健康趋势
        </div>
      </div>

      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <h4 style="margin:0;font-size:13px;color:#333;display:flex;align-items:center;gap:6px">
            🔋 电量趋势
          </h4>
          <span style="font-size:11px;color:#888">最近24小时</span>
        </div>
        <div ref="batteryChartRef" style="width:100%;height:120px"></div>
      </div>

      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <h4 style="margin:0;font-size:13px;color:#333;display:flex;align-items:center;gap:6px">
            🌡️ 温度波动
          </h4>
          <span style="font-size:11px;color:#888">最近24小时</span>
        </div>
        <div ref="tempChartRef" style="width:100%;height:120px"></div>
      </div>

      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <h4 style="margin:0;font-size:13px;color:#333;display:flex;align-items:center;gap:6px">
            ⏱️ 在线时长统计
          </h4>
          <span style="font-size:11px;color:#888">最近24小时</span>
        </div>
        <div v-if="selectedDevice" style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                <span style="color:#2e7d32">在线时长</span>
                <span style="font-weight:600;color:#2e7d32">{{ selectedDevice.onlineHours }}小时</span>
              </div>
              <div style="height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden">
                <div :style="{ height:'100%', background:'#4caf50', width: getOnlinePercent(selectedDevice) + '%', transition:'width 0.5s' }"></div>
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                <span style="color:#c62828">离线时长</span>
                <span style="font-weight:600;color:#c62828">{{ selectedDevice.offlineHours }}小时</span>
              </div>
              <div style="height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden">
                <div :style="{ height:'100%', background:'#e53935', width: (100 - getOnlinePercent(selectedDevice)) + '%', transition:'width 0.5s' }"></div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:12px;margin-top:4px">
            <div style="flex:1;text-align:center;padding:8px;background:#f1f8e9;border-radius:6px">
              <div style="font-size:18px;font-weight:700;color:#2e7d32">{{ getOnlinePercent(selectedDevice) }}%</div>
              <div style="font-size:10px;color:#666">在线率</div>
            </div>
            <div style="flex:1;text-align:center;padding:8px;background:#e3f2fd;border-radius:6px">
              <div style="font-size:18px;font-weight:700;color:#1565c0">{{ selectedDevice.alertCount }}</div>
              <div style="font-size:10px;color:#666">异常次数</div>
            </div>
          </div>
        </div>
        <div v-else style="text-align:center;padding:20px;color:#999;font-size:12px">
          请选择设备查看在线时长统计
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'priority'" style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px">
      <div style="background:#fff;padding:10px 12px;border-radius:8px;border:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:#666">按健康状态排序（低分优先）</span>
        <span style="font-size:11px;color:#999">共 {{ store.deviceHealthList.length }} 台设备</span>
      </div>

      <div v-for="health in store.deviceHealthList" :key="health.deviceId"
        @click="handleDeviceClick(health)"
        @mouseenter="handleHover(health.deviceId)"
        @mouseleave="handleHover(null)"
        :style="{ display:'flex', alignItems:'center', gap:'10px', padding:'12px',
          borderRadius:'8px', border:'2px solid ' + getPriorityBorderColor(health),
          background: store.highlightedDeviceId === health.deviceId ? '#e3f2fd' : '#fff',
          cursor:'pointer', transition:'all 0.2s ease' }">
        <div :style="{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'12px', fontWeight:700, flexShrink:0,
          background: getPriorityRankBg(health.priorityRank),
          color: health.priorityRank <= 3 ? '#fff' : '#666' }">
          {{ health.priorityRank }}
        </div>

        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-weight:600;font-size:13px;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ health.deviceName }}
            </span>
            <span :style="{ fontSize:'10px', padding:'1px 6px', borderRadius:'8px',
              background: getHealthScoreBgColor(health.healthScore),
              color: getHealthScoreTextColor(health.healthScore) }">
              {{ health.healthScore }}分
            </span>
            <span :style="{ fontSize:'12px', color: getTrendColor(health.healthTrend) }">
              {{ getTrendIcon(health.healthTrend) }}
            </span>
          </div>
          <div style="display:flex;gap:10px;font-size:11px;color:#888">
            <span>🔋 {{ health.batteryLevel }}%</span>
            <span>🌡️ {{ health.temperatureLevel }}°C</span>
            <span>⏱️ {{ health.onlineHours }}h在线</span>
          </div>
          <div style="margin-top:6px">
            <div style="height:4px;background:#e0e0e0;border-radius:2px;overflow:hidden">
              <div :style="{ height:'100%', background: getHealthScoreColor(health.healthScore),
                width: health.healthScore + '%', transition:'width 0.5s' }"></div>
            </div>
          </div>
        </div>

        <div style="flex-shrink:0;text-align:right">
          <div v-if="health.alertCount > 0"
            :style="{ fontSize:'10px', padding:'2px 6px', borderRadius:'8px',
              background:'#ffebee', color:'#c62828', fontWeight:600 }">
            ⚠️ {{ health.alertCount }}
          </div>
          <div v-if="health.lastAbnormalTime" style="font-size:10px;color:#999;margin-top:4px">
            {{ formatAbnormalTime(health.lastAbnormalTime) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'records'" style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px">
      <div style="background:#fff;padding:10px 12px;border-radius:8px;border:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:#666">最近异常记录</span>
        <span style="font-size:11px;color:#999">最近20条</span>
      </div>

      <div v-if="store.recentAbnormalRecords.length === 0"
        style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;color:#999;font-size:13px">
        <div style="font-size:32px;margin-bottom:8px">✅</div>
        <div>暂无异常记录</div>
      </div>

      <div v-for="alert in store.recentAbnormalRecords" :key="alert.id"
        @click="handleAlertClick(alert)"
        @mouseenter="handleHover(alert.deviceId)"
        @mouseleave="handleHover(null)"
        :style="{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'12px',
          borderRadius:'8px', border:'1px solid ' + getSeverityBorderColor(alert.severity),
          background: store.highlightedDeviceId === alert.deviceId ? getSeverityBgColor(alert.severity) : '#fff',
          cursor:'pointer', transition:'all 0.2s ease' }">
        <span :style="{ fontSize:'18px', flexShrink:0 }">{{ getAlertIcon(alert.type) }}</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;color:#333;margin-bottom:4px">
            {{ alert.message }}
          </div>
          <div style="font-size:11px;color:#888;margin-bottom:4px">
            📱 {{ getDeviceName(alert.deviceId) }}
            <span v-if="alert.fenceId" style="margin-left:8px">
              🗺️ {{ getFenceName(alert.fenceId) }}
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:10px;color:#999">{{ formatTime(alert.timestamp) }}</span>
            <span :style="{ fontSize:'10px', padding:'2px 6px', borderRadius:'4px', fontWeight:500,
              background: getSeverityColor(alert.severity) + '20', color: getSeverityColor(alert.severity) }">
              {{ getSeverityText(alert.severity) }}
            </span>
          </div>
        </div>
        <span v-if="alert.acknowledged" style="font-size:10px;padding:2px 6px;border-radius:8px;background:#e8f5e9;color:#2e7d32">已处理</span>
      </div>
    </div>

    <!-- ============ 分组巡检计划 ============ -->
    <div v-if="activeTab === 'plans'" style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px">
      <!-- 加载中 -->
      <div v-if="store.plansLoading" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#888;font-size:12px;padding:40px 0">
        <div :style="{ width:'28px', height:'28px', border:'3px solid #e0e0e0', borderTopColor:'#1976d2', borderRadius:'50%', animation:'dh-spin 0.8s linear infinite' }"></div>
        <div>正在加载巡检计划…</div>
      </div>

      <!-- 加载失败：空态 + 重试 -->
      <div v-else-if="store.plansLoadError"
        style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;color:#666;font-size:13px">
        <div style="font-size:32px;margin-bottom:8px">📡</div>
        <div style="font-weight:600;color:#c62828;margin-bottom:4px">巡检计划加载失败</div>
        <div style="font-size:11px;color:#999;margin-bottom:14px">请检查网络后重试，暂停中的计划历史数据不会丢失</div>
        <button @click="handleRetryLoadPlans"
          :disabled="store.plansLoading"
          style="padding:6px 18px;border-radius:6px;border:1px solid #1976d2;background:#e3f2fd;color:#1976d2;cursor:pointer;font-size:12px;font-weight:600">
          🔄 重新加载
        </button>
      </div>

      <template v-else>
        <!-- 系统无任何设备：空态 -->
        <div v-if="store.devices.length === 0"
          style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;color:#999;font-size:13px">
          <div style="font-size:32px;margin-bottom:8px">📭</div>
          <div>暂无可巡检设备</div>
          <div style="font-size:11px;margin-top:6px">请先注册设备后再建立巡检计划</div>
        </div>

        <template v-else>
          <div style="background:#fff;padding:10px 12px;border-radius:8px;border:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;color:#666">共 {{ store.inspectionPlans.length }} 个计划 · {{ activePlanCount }} 个进行中</span>
            <button @click="openCreatePlan"
              style="padding:5px 12px;border-radius:6px;border:none;background:#1976d2;color:#fff;cursor:pointer;font-size:12px;font-weight:600;flex-shrink:0">
              ➕ 新建计划
            </button>
          </div>

          <!-- 计划列表为空：空态 -->
          <div v-if="store.inspectionPlans.length === 0"
            style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;color:#999;font-size:13px">
            <div style="font-size:32px;margin-bottom:8px">🗂️</div>
            <div>暂无巡检计划</div>
            <div style="font-size:11px;margin-top:6px;margin-bottom:14px">管理员可建立分组巡检计划，统一关注一组设备的健康评分与在线率</div>
            <button @click="openCreatePlan"
              style="padding:6px 18px;border-radius:6px;border:1px solid #1976d2;background:#e3f2fd;color:#1976d2;cursor:pointer;font-size:12px;font-weight:600">
              ➕ 建立巡检计划
            </button>
          </div>

          <!-- 计划卡片 -->
          <div v-for="plan in store.inspectionPlans" :key="plan.id"
            style="background:#fff;border-radius:8px;border:1px solid #e0e0e0;padding:12px;display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
              <div style="min-width:0">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <span style="font-weight:700;font-size:13px;color:#333">{{ plan.name }}</span>
                  <span :style="getStatusBadgeStyle(plan.status)">
                    {{ plan.status === 'active' ? '🟢 进行中' : '⏸️ 已暂停' }}
                  </span>
                  <span v-if="plan.status === 'paused'" style="font-size:10px;color:#999">
                    不参与提醒 · 数据冻结于 {{ formatPlanTime(plan.pausedAt) }}
                  </span>
                </div>
                <div v-if="plan.description" style="font-size:11px;color:#999;margin-top:3px">{{ plan.description }}</div>
              </div>
            </div>

            <!-- 提醒条：仅活动计划且有低分设备时出现 -->
            <div v-if="store.getPlanReminderCount(plan) > 0"
              style="font-size:11px;color:#c62828;background:#ffebee;border-radius:6px;padding:6px 8px">
              🔔 {{ store.getPlanReminderCount(plan) }} 台负责设备健康分低于 60，建议优先巡检
            </div>
            <div v-else-if="plan.status === 'active'"
              style="font-size:11px;color:#2e7d32;background:#e8f5e9;border-radius:6px;padding:6px 8px">
              ✅ 负责设备整体健康，无需特别提醒
            </div>
            <div v-else
              style="font-size:11px;color:#888;background:#f5f5f5;border-radius:6px;padding:6px 8px">
              🔕 计划已暂停，暂停期间保留历史健康评分与在线率
            </div>

            <!-- 综合评分（活动实时 / 暂停冻结） -->
            <div v-if="getStats(plan)" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
              <div style="text-align:center;padding:8px 4px;background:#fafafa;border-radius:6px">
                <div :style="{ fontSize:'16px', fontWeight:700, color:getHealthScoreTextColor(getStats(plan)!.avgHealthScore) }">
                  {{ getStats(plan)!.avgHealthScore }}
                </div>
                <div style="font-size:10px;color:#888">{{ plan.status === 'paused' ? '冻结评分' : '综合评分' }}</div>
              </div>
              <div style="text-align:center;padding:8px 4px;background:#fafafa;border-radius:6px">
                <div style="font-size:16px;font-weight:700;color:#2e7d32">{{ getStats(plan)!.avgOnlineRate }}%</div>
                <div style="font-size:10px;color:#888">在线率</div>
              </div>
              <div style="text-align:center;padding:8px 4px;background:#fafafa;border-radius:6px">
                <div :style="{ fontSize:'16px', fontWeight:700, color:getStats(plan)!.avgBatteryLevel < 30 ? '#e65100' : '#1565c0' }">
                  {{ getStats(plan)!.avgBatteryLevel }}%
                </div>
                <div style="font-size:10px;color:#888">平均电量</div>
              </div>
              <div style="text-align:center;padding:8px 4px;background:#fafafa;border-radius:6px">
                <div :style="{ fontSize:'16px', fontWeight:700, color:getStats(plan)!.alertCount > 0 ? '#c62828' : '#2e7d32' }">
                  {{ getStats(plan)!.alertCount }}
                </div>
                <div style="font-size:10px;color:#888">待处理异常</div>
              </div>
            </div>

            <!-- 计划内无设备：空态 -->
            <div v-else
              style="font-size:11px;color:#e65100;background:#fff8e1;border-radius:6px;padding:8px;text-align:center">
              ⚠️ 该计划暂无负责设备，综合评分不可用，请调整负责设备
            </div>

            <!-- 历史健康评分 / 在线率趋势（暂停时保留） -->
            <div v-if="plan.history.length > 0" style="background:#fafafa;border-radius:6px;padding:8px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-size:10px;color:#888">📈 历史健康评分 / 在线率</span>
                <span style="font-size:10px;color:#bbb">最近 {{ plan.history.length }} 个巡检点</span>
              </div>
              <div v-html="renderPlanSparkline(plan)" style="line-height:0"></div>
              <div style="display:flex;gap:12px;margin-top:4px;font-size:10px;color:#888">
                <span><span style="color:#1976d2">●</span> 健康评分</span>
                <span><span style="color:#4caf50">●</span> 在线率</span>
              </div>
            </div>

            <!-- 负责设备 -->
            <div>
              <div style="font-size:10px;color:#888;margin-bottom:4px">负责设备（{{ plan.deviceIds.length }}）</div>
              <div v-if="plan.deviceIds.length > 0" style="display:flex;flex-wrap:wrap;gap:4px">
                <span v-for="id in plan.deviceIds" :key="id"
                  @click="jumpToDevice(id)"
                  style="font-size:10px;padding:2px 8px;border-radius:10px;background:#e3f2fd;color:#1565c0;cursor:pointer">
                  {{ getDeviceName(id) }}
                </span>
              </div>
              <div v-else style="font-size:11px;color:#999">未分配设备</div>
            </div>

            <!-- 状态流转 -->
            <div style="border-top:1px dashed #eee;padding-top:6px">
              <div v-for="(log, idx) in [...plan.statusLogs].slice(-3).reverse()" :key="idx"
                style="display:flex;gap:6px;font-size:10px;color:#999;margin-bottom:2px">
                <span>{{ getStatusLogIcon(log.type) }}</span>
                <span style="flex:1;color:#777">{{ log.message }}</span>
                <span style="flex-shrink:0">{{ formatPlanTime(log.timestamp) }}</span>
              </div>
            </div>

            <!-- 生命周期操作 -->
            <div style="display:flex;gap:6px;border-top:1px solid #f0f0f0;padding-top:8px">
              <button @click="openEditPlan(plan)"
                style="flex:1;padding:6px;border-radius:6px;border:1px solid #1976d2;background:#fff;color:#1976d2;cursor:pointer;font-size:11px;font-weight:600">
                🛠️ 调整设备
              </button>
              <button v-if="plan.status === 'active'" @click="handlePause(plan)"
                style="flex:1;padding:6px;border-radius:6px;border:1px solid #f57c00;background:#fff3e0;color:#e65100;cursor:pointer;font-size:11px;font-weight:600">
                ⏸️ 暂停计划
              </button>
              <button v-else @click="handleResume(plan)"
                style="flex:1;padding:6px;border-radius:6px;border:1px solid #2e7d32;background:#e8f5e9;color:#2e7d32;cursor:pointer;font-size:11px;font-weight:600">
                ▶️ 恢复计划
              </button>
            </div>
          </div>
        </template>
      </template>

      <!-- 新建 / 调整设备 编辑器 -->
      <div v-if="editorVisible"
        style="background:#fff;border-radius:8px;border:2px solid #1976d2;padding:12px;display:flex;flex-direction:column;gap:10px;position:sticky;bottom:0;box-shadow:0 -4px 12px rgba(0,0,0,0.08)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:700;font-size:13px;color:#333">
            {{ editorMode === 'create' ? '➕ 建立巡检计划' : '🛠️ 调整负责设备' }}
          </span>
          <button @click="closeEditor" style="background:none;border:none;cursor:pointer;color:#999;font-size:16px">×</button>
        </div>

        <div v-if="editorMode === 'create'">
          <label style="font-size:11px;color:#888;display:block;margin-bottom:4px">计划名称</label>
          <input v-model="editorName" type="text" placeholder="例如：生产设备日巡检"
            style="width:100%;box-sizing:border-box;padding:7px 10px;border:1px solid #ddd;border-radius:6px;font-size:12px;outline:none" />
          <label style="font-size:11px;color:#888;display:block;margin:8px 0 4px">计划说明（可选）</label>
          <input v-model="editorDescription" type="text" placeholder="计划的巡检范围或目的"
            style="width:100%;box-sizing:border-box;padding:7px 10px;border:1px solid #ddd;border-radius:6px;font-size:12px;outline:none" />
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <label style="font-size:11px;color:#888">负责设备（已选 {{ editorSelectedIds.length }} 台）</label>
            <div style="display:flex;gap:8px">
              <button type="button" @click="toggleSelectAllDevices(true)" style="background:none;border:none;color:#1976d2;font-size:11px;cursor:pointer">全选</button>
              <button type="button" @click="toggleSelectAllDevices(false)" style="background:none;border:none;color:#999;font-size:11px;cursor:pointer">清空</button>
            </div>
          </div>
          <div v-if="store.devices.length === 0" style="font-size:11px;color:#e65100;background:#fff8e1;border-radius:6px;padding:8px;text-align:center">
            暂无可分配设备，请先注册设备
          </div>
          <div v-else style="max-height:150px;overflow:auto;border:1px solid #eee;border-radius:6px;padding:6px;display:flex;flex-direction:column;gap:4px">
            <label v-for="device in store.devices" :key="device.id"
              style="display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:4px;cursor:pointer;font-size:12px"
              :style="{ background: editorSelectedIds.includes(device.id) ? '#e3f2fd' : 'transparent' }">
              <input type="checkbox" :checked="editorSelectedIds.includes(device.id)"
                @change="toggleDevice(device.id)" style="cursor:pointer" />
              <span style="flex:1;color:#333">{{ device.name }}</span>
              <span :style="{ fontSize:'10px', padding:'1px 6px', borderRadius:'8px',
                background:getHealthScoreBgColor(getDeviceHealthScore(device.id)),
                color:getHealthScoreTextColor(getDeviceHealthScore(device.id)) }">
                {{ getDeviceHealthScore(device.id) }}分
              </span>
            </label>
          </div>
        </div>

        <div style="display:flex;gap:8px">
          <button @click="closeEditor"
            style="flex:1;padding:8px;border-radius:6px;border:1px solid #ddd;background:#fff;color:#666;cursor:pointer;font-size:12px">
            取消
          </button>
          <button @click="handleSavePlan" :disabled="!canSavePlan"
            :style="{ flex:1, padding:'8px', borderRadius:'6px', border:'none', cursor: canSavePlan ? 'pointer' : 'not-allowed',
              background: canSavePlan ? '#1976d2' : '#bdbdbd', color:'#fff', fontSize:'12px', fontWeight:600 }">
            {{ editorMode === 'create' ? '建立计划' : '保存调整' }}
          </button>
        </div>
      </div>
    </div>

    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e0e0e0;flex-shrink:0">
      <div style="display:flex;gap:8px;font-size:11px;color:#888;flex-wrap:wrap;justify-content:center">
        <span>🟢 正常 ≥70分</span>
        <span>🟡 关注 40-69分</span>
        <span>🔴 预警 <40分</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useIotStore } from '../stores/iot';
import type { DeviceHealth, AlertType, AlertSeverity, Alert, HealthDataPoint, InspectionPlan, InspectionPlanStatus, PlanStatsSnapshot, PlanStatusLogType } from '../types';

const store = useIotStore();

const activeTab = ref<'overview' | 'priority' | 'records' | 'plans'>('priority');
const selectedDevice = ref<DeviceHealth | null>(null);
const batteryChartRef = ref<HTMLElement | null>(null);
const tempChartRef = ref<HTMLElement | null>(null);

// ---- 巡检计划 ----
const editorVisible = ref(false);
const editorMode = ref<'create' | 'edit'>('create');
const editingPlanId = ref<string | null>(null);
const editorName = ref('');
const editorDescription = ref('');
const editorSelectedIds = ref<string[]>([]);

const activePlanCount = computed(() => store.inspectionPlans.filter(p => p.status === 'active').length);
const canSavePlan = computed(() =>
  editorSelectedIds.value.length > 0 &&
  (editorMode.value === 'edit' || editorName.value.trim().length > 0)
);

function switchTab(tab: 'overview' | 'priority' | 'records' | 'plans') {
  activeTab.value = tab;
  if (tab === 'plans' && !store.plansLoaded && !store.plansLoading && !store.plansLoadError) {
    store.loadInspectionPlans().catch(() => { /* 失败态由页面内空态 + 重试承接 */ });
  }
}

function handleRetryLoadPlans() {
  store.retryLoadInspectionPlans().catch(() => { /* 保持失败空态，可再次重试 */ });
}

function ensurePlansLoaded() {
  if (store.plansLoaded || store.plansLoading || store.plansLoadError) return;
  store.loadInspectionPlans().catch(() => { /* 首次加载失败时展示重试空态 */ });
}

function openCreatePlan() {
  editorMode.value = 'create';
  editingPlanId.value = null;
  editorName.value = '';
  editorDescription.value = '';
  editorSelectedIds.value = [];
  editorVisible.value = true;
}

function openEditPlan(plan: InspectionPlan) {
  editorMode.value = 'edit';
  editingPlanId.value = plan.id;
  editorName.value = plan.name;
  editorDescription.value = plan.description || '';
  editorSelectedIds.value = [...plan.deviceIds];
  editorVisible.value = true;
}

function closeEditor() {
  editorVisible.value = false;
  editingPlanId.value = null;
}

function toggleDevice(deviceId: string) {
  const idx = editorSelectedIds.value.indexOf(deviceId);
  if (idx === -1) editorSelectedIds.value.push(deviceId);
  else editorSelectedIds.value.splice(idx, 1);
}

function toggleSelectAllDevices(select: boolean) {
  editorSelectedIds.value = select ? store.devices.map(d => d.id) : [];
}

function handleSavePlan() {
  if (!canSavePlan.value) return;
  if (editorMode.value === 'create') {
    store.createInspectionPlan(editorName.value, editorSelectedIds.value, editorDescription.value);
  } else if (editingPlanId.value) {
    store.updatePlanDevices(editingPlanId.value, editorSelectedIds.value);
  }
  closeEditor();
}

function handlePause(plan: InspectionPlan) {
  store.pauseInspectionPlan(plan.id);
}

function handleResume(plan: InspectionPlan) {
  store.resumeInspectionPlan(plan.id);
}

function getStats(plan: InspectionPlan): PlanStatsSnapshot | null {
  return store.getPlanStats(plan);
}

function getDeviceHealthScore(deviceId: string): number {
  return store.getDeviceHealth(deviceId)?.healthScore ?? 0;
}

function jumpToDevice(deviceId: string) {
  const health = store.getDeviceHealth(deviceId);
  if (health) {
    selectedDevice.value = health;
    store.setHighlightedDevice(deviceId);
    activeTab.value = 'overview';
    nextTick(() => renderCharts());
  }
}

function getStatusBadgeStyle(status: InspectionPlanStatus) {
  return {
    fontSize: '10px',
    padding: '1px 7px',
    borderRadius: '8px',
    fontWeight: 600,
    background: status === 'active' ? '#e8f5e9' : '#f5f5f5',
    color: status === 'active' ? '#2e7d32' : '#757575'
  };
}

function getStatusLogIcon(type: PlanStatusLogType): string {
  switch (type) {
    case 'created': return '🆕';
    case 'updated': return '🛠️';
    case 'active': return '▶️';
    case 'paused': return '⏸️';
  }
}

function formatPlanTime(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) +
    ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function renderPlanSparkline(plan: InspectionPlan): string {
  if (plan.history.length === 0) return '';
  const w = 360;
  const h = 48;
  const pad = 4;
  const points = plan.history;

  const toPath = (pick: (p: { avgHealthScore: number; avgOnlineRate: number }) => number, color: string) => {
    const coords = points.map((p, i) => {
      const x = pad + (i / Math.max(1, points.length - 1)) * (w - pad * 2);
      const y = pad + (1 - pick(p) / 100) * (h - pad * 2);
      return { x, y };
    });
    const d = coords.map((c, i) => (i === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)).join(' ');
    const last = coords[coords.length - 1];
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>` +
      `<circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="2.4" fill="${color}"/>`;
  };

  const scorePath = toPath(p => p.avgHealthScore, '#1976d2');
  const onlinePath = toPath(p => p.avgOnlineRate, '#4caf50');
  const grid = [25, 50, 75].map(v => {
    const y = pad + (1 - v / 100) * (h - pad * 2);
    return `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="#eee" stroke-dasharray="2,2"/>`;
  }).join('');

  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:${h}px;display:block;vector-effect:non-scaling-stroke">${grid}${scorePath}${onlinePath}</svg>`;
}

const currentHistoryData = computed(() => {
  if (selectedDevice.value) {
    return selectedDevice.value.historyData;
  }
  return store.deviceHealthList[0]?.historyData || [];
});

function handleDeviceClick(health: DeviceHealth) {
  selectedDevice.value = health;
  store.setHighlightedDevice(health.deviceId);
  activeTab.value = 'overview';
  nextTick(() => {
    renderCharts();
  });
}

function handleAlertClick(alert: Alert) {
  const health = store.getDeviceHealth(alert.deviceId);
  if (health) {
    selectedDevice.value = health;
  }
  store.setHighlightedDevice(alert.deviceId);
}

function handleHover(deviceId: string | null) {
  if (!store.highlightedDeviceId) {
    store.setHighlightedDevice(deviceId);
  }
}

function getHealthScoreColor(score: number): string {
  if (score >= 70) return '#4caf50';
  if (score >= 40) return '#ff9800';
  return '#f44336';
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

function getPriorityBorderColor(health: DeviceHealth): string {
  if (health.healthScore < 40) return '#ef9a9a';
  if (health.healthScore < 70) return '#ffe082';
  return '#e0e0e0';
}

function getPriorityRankBg(rank: number): string {
  if (rank === 1) return '#c62828';
  if (rank === 2) return '#e65100';
  if (rank === 3) return '#f9a825';
  return '#eeeeee';
}

function getTrendColor(trend: string): string {
  switch (trend) {
    case 'improving': return '#2e7d32';
    case 'declining': return '#c62828';
    default: return '#666';
  }
}

function getTrendIcon(trend: string): string {
  switch (trend) {
    case 'improving': return '📈';
    case 'declining': return '📉';
    default: return '➡️';
  }
}

function getTrendText(trend: string): string {
  switch (trend) {
    case 'improving': return '好转';
    case 'declining': return '恶化';
    default: return '稳定';
  }
}

function getOnlinePercent(health: DeviceHealth): number {
  const total = health.onlineHours + health.offlineHours;
  if (total === 0) return 0;
  return Math.round((health.onlineHours / total) * 100);
}

function getAlertIcon(type: AlertType): string {
  switch (type) {
    case 'enter': return '🚨';
    case 'exit': return '🚪';
    case 'low_battery': return '🔋';
    case 'offline': return '📵';
    default: return '⚠️';
  }
}

function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical': return '#e53935';
    case 'warning': return '#ff9800';
    case 'info': return '#2196f3';
    default: return '#666';
  }
}

function getSeverityBorderColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical': return '#ffcdd2';
    case 'warning': return '#ffe0b2';
    case 'info': return '#bbdefb';
    default: return '#e0e0e0';
  }
}

function getSeverityBgColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical': return '#ffebee';
    case 'warning': return '#fff3e0';
    case 'info': return '#e3f2fd';
    default: return '#f5f5f5';
  }
}

function getSeverityText(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical': return '严重';
    case 'warning': return '警告';
    case 'info': return '提示';
    default: return '未知';
  }
}

function getDeviceName(deviceId: string): string {
  return store.getDeviceById(deviceId)?.name || '未知设备';
}

function getFenceName(fenceId: string): string {
  return store.getFenceById(fenceId)?.name || '未知围栏';
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + ' 分钟前';
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + ' 小时前';
  } else {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function formatAbnormalTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前';
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前';
  } else {
    return Math.floor(diff / 86400000) + '天前';
  }
}

function renderLineChart(
  container: HTMLElement,
  data: HealthDataPoint[],
  valueKey: 'battery' | 'temperature',
  color: string,
  yMin: number,
  yMax: number,
  unit: string
) {
  if (!data || data.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:30px;color:#999;font-size:12px">暂无数据</div>';
    return;
  }

  const width = container.clientWidth;
  const height = 120;
  const padding = { top: 10, right: 30, bottom: 20, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d[valueKey]);
  const minVal = Math.min(...values, yMin);
  const maxVal = Math.max(...values, yMax);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d[valueKey] - minVal) / range) * chartHeight;
    return { x, y, value: d[valueKey] };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaD = `${pathD} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (i / 4) * chartHeight;
    const val = maxVal - (i / 4) * (maxVal - minVal);
    gridLines.push({ y, val: Math.round(val * 10) / 10 });
  }

  let svg = `<svg width="${width}" height="${height}" style="display:block">`;

  gridLines.forEach(line => {
    svg += `<line x1="${padding.left}" y1="${line.y}" x2="${padding.left + chartWidth}" y2="${line.y}" stroke="#eee" stroke-dasharray="3,3"/>`;
    svg += `<text x="${padding.left - 5}" y="${line.y + 4}" text-anchor="end" font-size="10" fill="#999">${line.val}${unit}</text>`;
  });

  svg += `<defs><linearGradient id="gradient-${valueKey}" x1="0%" y1="0%" x2="0%" y2="100%">`;
  svg += `<stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>`;
  svg += `<stop offset="100%" stop-color="${color}" stop-opacity="0"/>`;
  svg += `</linearGradient></defs>`;

  svg += `<path d="${areaD}" fill="url(#gradient-${valueKey})"/>`;
  svg += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2"/>`;

  points.forEach((p, i) => {
    if (i % Math.ceil(points.length / 6) === 0 || i === points.length - 1) {
      svg += `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${color}"/>`;
    }
  });

  const timeLabels = [];
  const labelCount = 6;
  for (let i = 0; i < labelCount; i++) {
    const idx = Math.floor((i / (labelCount - 1)) * (data.length - 1));
    const date = new Date(data[idx].timestamp);
    timeLabels.push({
      x: padding.left + (idx / (data.length - 1)) * chartWidth,
      label: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    });
  }

  timeLabels.forEach(label => {
    svg += `<text x="${label.x}" y="${height - 5}" text-anchor="middle" font-size="9" fill="#999">${label.label}</text>`;
  });

  svg += `</svg>`;
  container.innerHTML = svg;
}

function renderCharts() {
  if (batteryChartRef.value) {
    renderLineChart(batteryChartRef.value, currentHistoryData.value, 'battery', '#4caf50', 0, 100, '%');
  }
  if (tempChartRef.value) {
    renderLineChart(tempChartRef.value, currentHistoryData.value, 'temperature', '#ff9800', 15, 50, '°C');
  }
}

watch(selectedDevice, () => {
  nextTick(() => {
    renderCharts();
  });
});

watch(activeTab, (newTab) => {
  if (newTab === 'overview') {
    nextTick(() => {
      renderCharts();
    });
  }
});

onMounted(() => {
  if (store.deviceHealthList.length > 0 && !selectedDevice.value) {
    selectedDevice.value = store.deviceHealthList[0];
  }
  ensurePlansLoaded();
  nextTick(() => {
    renderCharts();
  });

  const handleResize = () => {
    renderCharts();
  };
  window.addEventListener('resize', handleResize);
});
</script>

<style>
@keyframes dh-spin {
  to { transform: rotate(360deg); }
}
</style>
