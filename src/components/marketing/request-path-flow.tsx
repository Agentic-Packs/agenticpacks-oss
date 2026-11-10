"use client";

import { useEffect, useRef, useState } from "react";
import { Coins, Database, KeyRound, MessagesSquare, Monitor, ShieldCheck, Waypoints, type LucideIcon } from "lucide-react";
import {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type Role = "browser" | "middleware" | "routes" | "chat" | "credits" | "auth" | "prisma";

type StepData = {
  icon: Role;
  title: string;
  detail: string;
};

type StepNodeType = Node<StepData, "step">;

const icons: Record<Role, LucideIcon> = {
  browser: Monitor,
  middleware: ShieldCheck,
  routes: Waypoints,
  chat: MessagesSquare,
  credits: Coins,
  auth: KeyRound,
  prisma: Database,
};

const nodeHeight = 60;
const serviceWidth = 204;
const columnGap = 14;
const rowWidth = serviceWidth * 3 + columnGap * 2;
const spineWidth = 248;
const spineX = (rowWidth - spineWidth) / 2;
const serviceY = 348;
const prismaY = 480;
const handleClass = "!h-px !w-px !min-h-0 !min-w-0 !border-0 !bg-transparent !opacity-0";

function StepNode({ data }: NodeProps<StepNodeType>) {
  const Icon = icons[data.icon];
  return (
    <div className="flex h-full w-full items-center gap-2.5 rounded-full border border-border bg-card px-3.5 text-foreground">
      {data.icon === "browser" ? <Handle type="source" id="out" position={Position.Bottom} className={handleClass} /> : null}
      {data.icon === "middleware" ? (
        <>
          <Handle type="target" id="in" position={Position.Top} className={handleClass} />
          <Handle type="source" id="out" position={Position.Bottom} className={handleClass} />
        </>
      ) : null}
      {data.icon === "routes" ? (
        <>
          <Handle type="target" id="in" position={Position.Top} className={handleClass} />
          <Handle type="source" id="chat" position={Position.Bottom} className={handleClass} style={{ left: "22%" }} />
          <Handle type="source" id="credits" position={Position.Bottom} className={handleClass} style={{ left: "50%" }} />
          <Handle type="source" id="auth" position={Position.Bottom} className={handleClass} style={{ left: "78%" }} />
        </>
      ) : null}
      {data.icon === "chat" || data.icon === "credits" || data.icon === "auth" ? (
        <>
          <Handle type="target" id="in" position={Position.Top} className={handleClass} />
          <Handle type="source" id="out" position={Position.Bottom} className={handleClass} />
        </>
      ) : null}
      {data.icon === "prisma" ? (
        <>
          <Handle type="target" id="chat" position={Position.Top} className={handleClass} style={{ left: "22%" }} />
          <Handle type="target" id="credits" position={Position.Top} className={handleClass} style={{ left: "50%" }} />
          <Handle type="target" id="auth" position={Position.Top} className={handleClass} style={{ left: "78%" }} />
        </>
      ) : null}
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">{data.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{data.detail}</p>
      </div>
    </div>
  );
}

const nodeTypes = { step: StepNode };

function step(id: string, icon: Role, title: string, detail: string, x: number, y: number, width: number): StepNodeType {
  return {
    id,
    type: "step",
    position: { x, y },
    width,
    height: nodeHeight,
    draggable: false,
    selectable: false,
    connectable: false,
    data: { icon, title, detail },
  };
}

const nodes: StepNodeType[] = [
  step("browser", "browser", "Browser", "Sends the request", spineX, 0, spineWidth),
  step("middleware", "middleware", "Middleware", "Auth.js JWT", spineX, 108, spineWidth),
  step("routes", "routes", "API routes", "Zod via withValidation", spineX, 216, spineWidth),
  step("chat", "chat", "AI streaming", "GPT-5 Mini", 0, serviceY, serviceWidth),
  step("credits", "credits", "Credits", "Counted in Postgres", serviceWidth + columnGap, serviceY, serviceWidth),
  step("auth", "auth", "Auth.js", "Google and credentials", (serviceWidth + columnGap) * 2, serviceY, serviceWidth),
  step("prisma", "prisma", "Prisma", "PostgreSQL 16", spineX, prismaY, spineWidth),
];

const arrow = {
  type: "smoothstep" as const,
  pathOptions: { borderRadius: 12 },
  style: { stroke: "hsl(var(--primary))", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: "hsl(var(--primary))" },
};

const edges: Edge[] = [
  { id: "browser-middleware", source: "browser", target: "middleware", sourceHandle: "out", targetHandle: "in", ...arrow },
  { id: "middleware-routes", source: "middleware", target: "routes", sourceHandle: "out", targetHandle: "in", ...arrow },
  { id: "routes-chat", source: "routes", target: "chat", sourceHandle: "chat", targetHandle: "in", ...arrow },
  { id: "routes-credits", source: "routes", target: "credits", sourceHandle: "credits", targetHandle: "in", ...arrow },
  { id: "routes-auth", source: "routes", target: "auth", sourceHandle: "auth", targetHandle: "in", ...arrow },
  { id: "chat-prisma", source: "chat", target: "prisma", sourceHandle: "out", targetHandle: "chat", ...arrow },
  { id: "credits-prisma", source: "credits", target: "prisma", sourceHandle: "out", targetHandle: "credits", ...arrow },
  { id: "auth-prisma", source: "auth", target: "prisma", sourceHandle: "out", targetHandle: "auth", ...arrow },
];

const fitOptions = { padding: 0.08, maxZoom: 1, minZoom: 0.45 };

function FittedFlow({ colorMode }: { colorMode: "light" | "dark" }) {
  const frame = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const fit = () => {
      void fitView({ ...fitOptions, duration: 0 });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fitView]);

  return (
    <div ref={frame} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode={colorMode}
        fitView
        fitViewOptions={fitOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        edgesFocusable={false}
        nodesFocusable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        selectionOnDrag={false}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
        className="h-full w-full"
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="hsl(var(--border))" />
      </ReactFlow>
    </div>
  );
}

export function RequestPathFlow() {
  const [colorMode, setColorMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setColorMode(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      className="request-path h-[32rem] w-full text-foreground sm:h-[36rem] [&_.react-flow]:!bg-transparent [&_.react-flow__node]:cursor-default"
      aria-label="The browser passes Auth.js middleware and API routes, which call AI streaming, the credit counter, and Auth.js, then Prisma writes PostgreSQL"
    >
      <style>{`
        .request-path .react-flow__edge-path {
          stroke: hsl(var(--primary));
        }
        .request-path marker path,
        .request-path marker polyline {
          stroke: hsl(var(--primary));
          fill: hsl(var(--primary));
        }
      `}</style>
      <ReactFlowProvider>
        <FittedFlow colorMode={colorMode} />
      </ReactFlowProvider>
    </figure>
  );
}
