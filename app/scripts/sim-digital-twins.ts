// Seeds a small internal team so the OpenChat digital-twin/A2A shape can be
// evaluated without connecting real Codex sessions or importing private data.
export {};

const BASE = process.env.PLATFORM_URL ?? 'http://127.0.0.1:4319';
const TOKEN = process.env.PLATFORM_TOKEN ?? '';

async function api<T = any>(path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (TOKEN) headers.authorization = `Bearer ${TOKEN}`;
  const res = await fetch(BASE + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

type DemoIdentity = {
  key: string;
  name: string;
  runtime: 'sim-digital-twin' | 'sim-codex';
  workPath: string;
  task: string;
  description: string;
};

const identities: DemoIdentity[] = [
  { key: 'pop-twin', name: 'POP/分身', runtime: 'sim-digital-twin', workPath: '/team/pop', task: '归纳 POP 的决策、承诺和待办', description: '代表 POP 整理上下文，不替本人做高风险决定。' },
  { key: 'pop-codex', name: 'POP/Codex', runtime: 'sim-codex', workPath: '/team/pop/openchat', task: '开发 OpenChat 与 A2A 流转', description: '本机 Codex 执行者，交付文件、提交和测试证据。' },
  { key: 'ruochao-twin', name: '若超/分身', runtime: 'sim-digital-twin', workPath: '/team/ruochao', task: '同步若超的项目进度与阻塞', description: '若超的数字分身，负责让其他成员快速获取当前上下文。' },
  { key: 'ruochao-codex', name: '若超/Codex', runtime: 'sim-codex', workPath: '/team/ruochao/openchat', task: '处理前端与交互任务', description: '若超电脑上的 Codex 执行者。' },
  { key: 'haonan-twin', name: '浩楠/分身', runtime: 'sim-digital-twin', workPath: '/team/haonan', task: '同步浩楠的方案判断与待办', description: '浩楠的数字分身，回答已确认事实并标记不确定项。' },
  { key: 'haonan-codex', name: '浩楠/Codex', runtime: 'sim-codex', workPath: '/team/haonan/openchat', task: '处理服务端与联调任务', description: '浩楠电脑上的 Codex 执行者。' },
];

async function main() {
  console.log(`[twins] OpenChat: ${BASE}`);
  const ids = new Map<string, string>();

  for (const item of identities) {
    const { session } = await api<{ session: { id: string } }>('/api/sessions/register', {
      runtime: item.runtime,
      workPath: item.workPath,
      task: item.task,
      bindKey: `openchat-demo-${item.key}`,
      name: item.name,
      description: item.description,
    });
    ids.set(item.key, session.id);
    await api(`/api/sessions/${session.id}/status`, { status: 'working' });
  }

  const { channels } = await api<{ channels: Array<{ id: string; name: string }> }>('/api/channels');
  let channel = channels.find((c) => c.name === 'A2A 试验室');
  if (!channel) {
    const created = await api<{ channel: { id: string; name: string } }>('/api/channels', {
      name: 'A2A 试验室',
      participants: [...ids.values()],
    });
    channel = created.channel;
  } else {
    for (const sessionId of ids.values()) {
      await api(`/api/channels/${channel.id}/participants`, { sessionId });
    }
  }

  const ch = channel.id;
  await api(`/api/channels/${ch}/messages`, {
    text: '我们先试一轮：每个人只报进度、阻塞和下一步。需要执行时，直接 @ 对应的 Codex。',
  });
  await api(`/api/sessions/${ids.get('ruochao-twin')}/channel-post`, {
    channelId: ch,
    text: '前端框架已经能跑。当前阻塞是多人身份还没有独立登录；下一步先用同一 Tailscale 内网做 3 人试用。',
  });
  await api(`/api/sessions/${ids.get('pop-twin')}/channel-post`, {
    channelId: ch,
    toSessionId: ids.get('pop-codex'),
    text: '@POP/Codex 请把“联系人身份标签 + 群内定向 @ + 内嵌终端”跑通，并给出测试证据。',
  });
  await api(`/api/sessions/${ids.get('pop-codex')}/channel-post`, {
    channelId: ch,
    text: '已接单。我会返回：修改文件、运行结果、可访问地址；不会只回复“完成”。',
  });
  await api(`/api/sessions/${ids.get('haonan-twin')}/channel-post`, {
    channelId: ch,
    text: '建议第一阶段不做飞书同步，也不做公网开放。先验证大家会不会自然地在这里 @ 分身和 Codex。',
  });
  await api(`/api/sessions/${ids.get('ruochao-codex')}/channel-ask`, {
    channelId: ch,
    question: '多人登录暂未实现。试用版是否接受“同一内网、一个团队身份”的边界？',
    options: ['接受，先试用', '必须先做多人登录'],
  });

  console.log(`[twins] seeded ${identities.length} identities and channel "${channel.name}" (${ch})`);
  console.log('[twins] open the Channels view and select “A2A 试验室”.');
}

main().catch((error) => {
  console.error('[twins] error:', error);
  process.exit(1);
});
