import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  NodeDragHandler,
  Handle,
  Position,
  NodeProps,
  EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Connection,
  ConnectionMode,
  OnConnectStart,
} from "reactflow";
import type { ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Eye, RotateCw, SquarePen, Trash2, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTERS } from "@/constant";
import { useTranslation } from "react-i18next";
import {
  useChatbotFlowQuery,
  useDeleteChatbotMutation,
  useUpdateChatbotLineFlowMutation,
  useUpdateChatbotPositionMutation,
} from "@/hooks/useChatbotQuery";
import type {
  AnswerDisplay,
  ChatbotFlowNode,
  ChatbotRecord,
  NodeData,
  PendingRemoval,
  QuestionEdgeData,
  UpdateChatbotPositionPayload,
} from "@/dataHelper/chatbot.dataHelper";
import QuestionDeleteDialog from "../QuestionManager/components/QuestionDeleteDialog";
import isEqual from "lodash/isEqual";

  const QuestionFlowPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSearch = (location.state as { fromSearch?: string } | undefined)?.fromSearch ?? "";

  const { data, isLoading, isError, refetch } = useChatbotFlowQuery();
  const updatePositionMutation = useUpdateChatbotPositionMutation();
  const updateLineMutation = useUpdateChatbotLineFlowMutation();
  const deleteMutation = useDeleteChatbotMutation();
  const flowData = data?.data ?? ([] as ChatbotFlowNode[]);
  const reactFlowInstanceRef = useRef<ReactFlowInstance<NodeData, QuestionEdgeData> | null>(null);

  const pendingRemovalRef = useRef<PendingRemoval | null>(null);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    answerId: null as number | null,
    questionId: null as number | null,
    sourceQuestionId: null as number | null,
    answerLabel: "",
    questionLabel: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<ChatbotRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const pendingConnectionRef = useRef<{ answerId: number; sourceId: number | null; lastTargetId: number | null } | null>(null);
  const autoConnectedRef = useRef<Map<number, number>>(new Map());
  const pointerMoveListenerRef = useRef<(event: PointerEvent) => void>();
  const QuestionFlowEdge: React.FC<EdgeProps<QuestionEdgeData>> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    source,
  }) => {
    const { t } = useTranslation();

    const handleRemove = useCallback(
      () => {
        if (!data?.answerId) return;
        const sourceQuestionId = Number.isFinite(Number(source)) ? Number(source) : null;
        const nextQuestionId = data?.nextQuestionId ?? null;
        setConfirmState({
          isOpen: true,
          answerId: data.answerId,
          questionId: nextQuestionId,
          sourceQuestionId,
          answerLabel: data?.answerLabel ?? "",
          questionLabel: data?.questionLabel ?? "",
        });
        pendingRemovalRef.current = {
          answerId: data.answerId,
          sourceQuestionId,
          targetQuestionId: nextQuestionId,
          payload: { answer_id: data.answerId },
          removeAnswer: nextQuestionId === null,
        };
      },
      [data?.answerId, data?.nextQuestionId, data?.answerLabel, data?.questionLabel, source],
    );

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            strokeWidth: 4,
            stroke: "#2563eb",
            strokeOpacity: 0.92,
            strokeLinecap: "round",
            filter: "drop-shadow(0px 2px 6px rgba(37, 99, 235, 0.35))",
          }}
        />
        <EdgeLabelRenderer>
          <button
            type="button"
            onClick={handleRemove}
            disabled={updateLineMutation.isPending}
            className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 shadow-lg transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
            style={{ left: labelX, top: labelY, pointerEvents: updateLineMutation.isPending ? "none" : "all" }}
            aria-label={t("questions.flow.delete_edge")}
          >
            <X className="size-4" />
          </button>
        </EdgeLabelRenderer>
      </>
    );
  };

  const QuestionFlowNode: React.FC<NodeProps<NodeData>> = ({ data }) => (
    <div
      className={`relative w-[420px] min-h-[320px] rounded-2xl border-2 bg-white shadow-[0_24px_55px_-30px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:shadow-[0_32px_68px_-35px_rgba(15,23,42,0.35)] ${
        data.isHighlighted
          ? "border-[#3399FF] ring-2 ring-[#3399FF]/30"
          : "border-slate-200"
      }`}
    >
      {!data.isStartNode ? (
        <Handle
          type="target"
          position={Position.Left}
          id="drop-zone"
          className="pointer-events-auto absolute rounded-[40px] opacity-0"
          style={{
            zIndex: 60,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />
      ) : null}
      <div
        className={`relative flex min-h-[96px] items-center rounded-t-2xl border-b border-slate-200/70 px-7 py-5 ${data.headerClass}`}
        style={{ background: data.headerBackground }}
      >
        {!data.isStartNode ? (
          <Handle
            type="target"
            position={Position.Left}
            id="title"
            className={`pointer-events-auto absolute -left-[19px] top-1/2 -translate-y-1/2 cursor-grab rounded-full transition-transform duration-150 hover:scale-110 active:scale-105 active:cursor-grabbing ${data.targetHandleClass}`}
            style={{
              zIndex: 12,
              background: "#FFFFFF",
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: data.borderColor,
              width: "18px",
              height: "18px",
              minWidth: "18px",
              minHeight: "18px",
            }}
          />
        ) : null}

        <div className="flex w-fit items-center gap-3">
          <span className="text-[15px] font-semibold uppercase tracking-wider text-slate-600">#{data.questionId}</span>
          {data.isStartNode ? (
            <span className="rounded-full border border-blue-200 px-3 py-[2px] text-[14px] font-semibold text-blue-600">
              {t("questions.detail.start_node")}
            </span>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => data.onView(data.questionId)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
            aria-label={data.translations.view}
            title={data.translations.view}
          >
            <Eye className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => data.onEdit(data.questionId)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
            aria-label={data.translations.edit}
            title={data.translations.edit}
          >
            <SquarePen className="size-5" />
          </button>
          <button
            type="button"
            onClick={() =>
              data.onDelete({ id: data.questionId, content: data.content, total_answers: data.answers.length, type: data.questionType })
            }
            className="inline-flex size-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50"
            aria-label={data.translations.delete}
            title={data.translations.delete}
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </div>
      <div className="border-b border-slate-200/70 bg-transparent px-7 py-5">
        <span className={`block text-xl font-semibold leading-relaxed ${data.questionTextClass}`}>{data.content}</span>
      </div>
      <div className={`flex min-h-[180px] flex-col gap-5 rounded-b-2xl border-t border-slate-200/70 bg-white px-7 py-6 ${data.answersContainerClass}`}>
        <div className={`inline-flex items-center gap-3 text-[15px] font-semibold uppercase tracking-wide ${data.answersLabelClass}`}>
          <span className={`size-2.5 rounded-full shadow-sm ${data.answersIconClass}`} />
          {data.answersLabel}
        </div>
        {data.answers.length ? (
          <ul className="flex flex-col gap-4 text-lg text-slate-600">
            {data.answers.map((answer) => (
              <li
                key={answer.id}
                className={`relative flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-md transition ${data.answerCardClass}`}
              >
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`answer-${answer.id}`}
                  className={`pointer-events-auto absolute top-1/2 -translate-y-1/2 cursor-grab rounded-full transition-transform duration-150 hover:scale-110 active:scale-105 active:cursor-grabbing ${data.sourceHandleClass}`}
                  style={{
                    zIndex: 25,
                    background: "#FFFFFF",
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: data.borderColor,
                    width: "18px",
                    height: "18px",
                    minWidth: "18px",
                    minHeight: "18px",
                    right: "-28px",
                  }}
                />
                <span className="line-clamp-2 whitespace-pre-wrap break-words text-lg font-semibold text-slate-700">
                  {answer.content}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-lg italic text-slate-400">{data.noAnswersLabel}</span>
        )}
      </div>
    </div>
  );

    const nodeTypes = useMemo(() => ({ questionNode: QuestionFlowNode }), []);
  const edgeTypes = useMemo(() => ({ questionEdge: QuestionFlowEdge }), []);

  const startNodeIds = useMemo(() => {
    return new Set(flowData.filter((question) => question.is_start_node === 1).map((question) => question.id));
  }, [flowData]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const questionLookup = new Map(flowData.map((question) => [question.id, question]));

    const flowNodes: Node<NodeData>[] = flowData.map((question) => {
      const answersForNode: AnswerDisplay[] = (question.answers ?? []).map((answer) => ({
        id: answer.id,
        content: answer.content,
      }));

      const isStartNode = question.is_start_node === 1;

      return {
        id: String(question.id),
        position: {
          x: question.position_x ?? 0,
          y: question.position_y ?? 0,
        },
        data: {
          questionId: question.id,
          content: question.content,
          isStartNode,
          questionType: question.type,
          onView: (id: number) => {
            navigate(ROUTERS.QUESTION_DETAIL.replace(":id", String(id)), fromSearch ? { state: { fromSearch } } : undefined);
          },
          onEdit: (id: number) => {
            navigate(ROUTERS.QUESTION_UPDATE.replace(":id", String(id)), fromSearch ? { state: { fromSearch } } : undefined);
          },
          onDelete: (target: ChatbotRecord) => {
            setDeleteTarget(target);
            setDeleteOpen(true);
          },
          translations: {
            view: t("questions.actions_view"),
            edit: t("questions.actions_edit"),
            delete: t("questions.actions_delete"),
          },
          answersLabel: t("questions.flow.answers"),
          noAnswersLabel: t("questions.flow.no_answers"),
          answers: answersForNode,
          borderColor: isStartNode ? "#3b82f6" : "#10b981",
          headerBackground: isStartNode
            ? "linear-gradient(145deg, #f9fbff 0%, #eef4ff 55%, #e1ebff 100%)"
            : "linear-gradient(145deg, #f6fdf9 0%, #e8fbf1 55%, #dcf7e8 100%)",
          headerClass: isStartNode
            ? "text-blue-900"
            : "text-emerald-900",
          idBadgeClass: isStartNode ? "bg-white/60 text-blue-700" : "bg-white/60 text-emerald-700",
          startTagClass: isStartNode ? "bg-blue-200/80 text-blue-700" : "bg-emerald-200/80 text-emerald-700",
          questionTextClass: "text-slate-900 bg-transparent",
          answersContainerClass: "bg-white",
          answersLabelClass: "text-slate-500",
          answersIconClass: isStartNode ? "bg-blue-400" : "bg-emerald-400",
          answerCardClass: "border-slate-200/70",
          sourceHandleClass: isStartNode ? "bg-white text-blue-600" : "bg-white text-emerald-600",
          targetHandleClass: "bg-white",
          answerNextDotClass: isStartNode ? "bg-blue-300" : "bg-emerald-300",
          isHighlighted: false,
        },
        type: "questionNode",
        style: { border: "none", background: "transparent", zIndex: 20 },
      };
    });

    const flowEdges: Edge<QuestionEdgeData>[] = flowData.flatMap((question) =>
      (question.answers || [])
        .filter((answer) => answer.next_question_id)
        .map((answer) => {
          return {
            id: `${answer.id}`,
            source: String(question.id),
            target: String(answer.next_question_id),
            sourceHandle: `answer-${answer.id}`,
            targetHandle: "title",
            animated: true,
            type: "questionEdge",
            data: {
              answerId: answer.id,
              nextQuestionId: answer.next_question_id,
              answerLabel: answer.content,
              questionLabel: answer.next_question_id ? questionLookup.get(answer.next_question_id)?.content : undefined,
            },
          };
        })
    );

    return { nodes: flowNodes, edges: flowEdges };
  }, [flowData, t]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const pendingTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const dragStartRef = useRef<Record<string, { x: number; y: number }>>({});

  const schedulePositionUpdate = useCallback(
    (id: number, payload: UpdateChatbotPositionPayload) => {
      const timers = pendingTimersRef.current;
      if (timers[id]) {
        clearTimeout(timers[id]);
      }

      timers[id] = setTimeout(() => {
        updatePositionMutation.mutate({ id, payload });
        delete timers[id];
      }, 200);
    },
    [updatePositionMutation],
  );

useEffect(() => {
  setNodes((current) => {
    return isEqual(current, initialNodes) ? current : initialNodes;
  });
}, [initialNodes]);

useEffect(() => {
  setEdges((current) => {
    return isEqual(current, initialEdges) ? current : initialEdges;
  });
}, [initialEdges]);

  useEffect(
    () => () => {
      Object.values(pendingTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });
    },
    [],
  );

  const handleNodeDragStart = useCallback<NodeDragHandler>((_event, node) => {
    dragStartRef.current[node.id] = {
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    };
  }, []);

  const handleNodeDragStop = useCallback<NodeDragHandler>(
    (_event, node) => {
      const typedNode = node as Node<NodeData>;
      const id = Number(node.id);
      if (Number.isNaN(id)) return;

      const position_x = Math.round(typedNode.position.x);
      const position_y = Math.round(typedNode.position.y);

      const startPosition = dragStartRef.current[node.id];
      if (startPosition && startPosition.x === position_x && startPosition.y === position_y) {
        delete dragStartRef.current[node.id];
        return;
      }

      setNodes((current) =>
        current.map((existing) =>
          existing.id === typedNode.id ? { ...existing, position: { x: position_x, y: position_y } } : existing,
        ),
      );

      schedulePositionUpdate(id, { position_x, position_y });
      delete dragStartRef.current[node.id];
    },
    [schedulePositionUpdate, setNodes],
  );

  const finalizeConnection = useCallback(
    (answerId: number, sourceId: number | null, targetId: number) => {
      if (Number.isNaN(answerId) || Number.isNaN(targetId)) return;

      if (sourceId !== null && sourceId === targetId) {
        pendingConnectionRef.current = null;
        setIsConnecting(false);
        setHighlightedNodeId(null);
        return;
      }

      setEdges((current) => {
        const existing = current.find((edge) => edge.id === String(answerId));
        if (existing && Number(existing.target) === targetId) {
          return current;
        }

        const filtered = current.filter((edge) => edge.id !== String(answerId));
        const nextEdge: Edge<QuestionEdgeData> = {
          id: String(answerId),
          source: String(sourceId ?? ""),
          target: String(targetId),
          sourceHandle: `answer-${answerId}`,
          targetHandle: "title",
          animated: true,
          type: "questionEdge",
          data: {
            answerId,
            nextQuestionId: targetId,
          },
        };

        return [...filtered, nextEdge];
      });

      updateLineMutation.mutate({ answerId, payload: { answer_id: answerId, next_question_id: targetId } });
      autoConnectedRef.current.set(answerId, targetId);
      pendingConnectionRef.current = null;
      setIsConnecting(false);
      setHighlightedNodeId(null);
    },
    [setEdges, updateLineMutation],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const answerMatch = connection.sourceHandle?.match(/^answer-(\d+)$/);
      const answerId = answerMatch ? Number(answerMatch[1]) : null;
      if (!answerId || Number.isNaN(answerId)) {
        return;
      }

      const sourceId = connection.source ? Number(connection.source) : null;
      let nextQuestionId = connection.target ? Number(connection.target) : null;

      if ((!nextQuestionId || Number.isNaN(nextQuestionId)) && pendingConnectionRef.current) {
        const pending = pendingConnectionRef.current;
        if (pending.answerId === answerId && pending.lastTargetId && !Number.isNaN(pending.lastTargetId)) {
          nextQuestionId = pending.lastTargetId;
        }
      }

      if (!nextQuestionId || Number.isNaN(nextQuestionId)) {
        pendingConnectionRef.current = null;
        setIsConnecting(false);
        setHighlightedNodeId(null);
        return;
      }

      if (
        (sourceId !== null && sourceId === nextQuestionId) ||
        startNodeIds.has(nextQuestionId)
      ) {
        pendingConnectionRef.current = null;
        setIsConnecting(false);
        setHighlightedNodeId(null);
        return;
      }

      const autoTarget = autoConnectedRef.current.get(answerId);
      if (autoTarget && nextQuestionId === autoTarget) {
        autoConnectedRef.current.delete(answerId);
        return;
      }

      finalizeConnection(answerId, sourceId, nextQuestionId);
    },
    [finalizeConnection],
  );

  useEffect(() => {
    setNodes((current) =>
      current.map((node) =>
        node.data && typeof node.data === "object"
          ? {
              ...node,
              data: {
                ...node.data,
                isHighlighted: highlightedNodeId === node.id,
              },
            }
          : node,
      ),
    );
  }, [highlightedNodeId, setNodes]);

  const handleConnectStart = useCallback<OnConnectStart>((_event, params) => {
    setIsConnecting(true);
    setHighlightedNodeId(null);

    const handleId = params.handleId;
    const answerMatch = handleId?.match(/^answer-(\d+)$/);
    const answerId = answerMatch ? Number(answerMatch[1]) : null;
    const sourceId = params.nodeId ? Number(params.nodeId) : null;

    if (!answerId || Number.isNaN(answerId)) {
      pendingConnectionRef.current = null;
      return;
    }

    autoConnectedRef.current.delete(answerId);
    pendingConnectionRef.current = { answerId, sourceId: Number.isNaN(sourceId) ? null : sourceId, lastTargetId: null };
  }, []);

  const handleConnectEnd = useCallback(
    (_event?: MouseEvent | TouchEvent | PointerEvent) => {
      const pending = pendingConnectionRef.current;

      if (
        pending &&
        pending.answerId &&
        pending.lastTargetId &&
        (!pending.sourceId || pending.sourceId !== pending.lastTargetId)
      ) {
        finalizeConnection(pending.answerId, pending.sourceId, pending.lastTargetId);
      }

      setIsConnecting(false);
      setHighlightedNodeId(null);
      pendingConnectionRef.current = null;
    },
    [finalizeConnection],
  );

  useEffect(() => {
    if (!isConnecting) {
      setHighlightedNodeId(null);
    }
  }, [isConnecting]);

  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node<NodeData>) => {
      if (!isConnecting) return;
      setHighlightedNodeId(node.id);
    },
    [isConnecting],
  );

  const handleNodeMouseLeave = useCallback(() => {
    if (!isConnecting) return;
    setHighlightedNodeId(null);
  }, [isConnecting]);

  useEffect(() => {
    if (!isConnecting) {
      if (pointerMoveListenerRef.current) {
        window.removeEventListener("pointermove", pointerMoveListenerRef.current);
        pointerMoveListenerRef.current = undefined;
      }
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const instance = reactFlowInstanceRef.current;
      if (!instance) {
        setHighlightedNodeId(null);
        return;
      }

      const pending = pendingConnectionRef.current;
      if (!pending) {
        setHighlightedNodeId(null);
        return;
      }

      let element = event.target instanceof Element ? (event.target as Element) : null;
      if (!element) {
        element = document.elementFromPoint(event.clientX, event.clientY);
      }

      let nodeElement: Element | null = element;
      while (nodeElement && !nodeElement.classList.contains("react-flow__node")) {
        nodeElement = nodeElement.parentElement;
      }

      if (!nodeElement) {
        setHighlightedNodeId(null);
        pendingConnectionRef.current = { ...pending, lastTargetId: null };
        return;
      }

      const nodeIdAttr = nodeElement.getAttribute("data-id");
      if (!nodeIdAttr) {
        setHighlightedNodeId(null);
        pendingConnectionRef.current = { ...pending, lastTargetId: null };
        return;
      }

      const targetId = Number(nodeIdAttr);
      if (Number.isNaN(targetId)) {
        setHighlightedNodeId(null);
        pendingConnectionRef.current = { ...pending, lastTargetId: null };
        return;
      }

      if (
        (pending.sourceId !== null && pending.sourceId === targetId) ||
        startNodeIds.has(targetId)
      ) {
        setHighlightedNodeId(null);
        pendingConnectionRef.current = { ...pending, lastTargetId: null };
        return;
      }

      setHighlightedNodeId(nodeIdAttr);
      pendingConnectionRef.current = { ...pending, lastTargetId: targetId };
    };

    pointerMoveListenerRef.current = handlePointerMove;
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      pointerMoveListenerRef.current = undefined;
    };
  }, [isConnecting]);

  const handleDialogClose = useCallback(() => {
    if (!updateLineMutation.isPending) {
      setConfirmState((prev) => ({
        ...prev,
        isOpen: false,
        answerId: null,
        questionId: null,
        sourceQuestionId: null,
        answerLabel: "",
        questionLabel: "",
      }));
      pendingRemovalRef.current = null;
    }
  }, [updateLineMutation.isPending]);

  const handleConfirmDelete = useCallback(() => {
    const pending = pendingRemovalRef.current;
    if (!pending) return;

    setEdges((current) => current.filter((edge) => edge.id !== String(pending.answerId)));

    if (pending.removeAnswer && pending.sourceQuestionId !== null) {
      setNodes((current) =>
        current.map((node) => {
          if (Number(node.id) !== pending.sourceQuestionId) return node;
          return {
            ...node,
            data: {
              ...node.data,
              answers: node.data.answers.filter((answer) => answer.id !== pending.answerId),
            },
          };
        }),
      );
    }

    updateLineMutation.mutate(
      { answerId: pending.answerId, payload: pending.payload },
      {
        onSettled: () => {
          handleDialogClose();
        },
      },
    );
  }, [handleDialogClose, setEdges, setNodes, updateLineMutation]);

  const handleCloseDeleteDialog = useCallback(() => {
    if (deleteMutation.isPending) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
  }, [deleteMutation.isPending]);

  const handleDeleteChatbot = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      handleCloseDeleteDialog();
      refetch();
    } catch (error) {
      console.error(error);
    }
  }, [deleteMutation, deleteTarget, handleCloseDeleteDialog, refetch]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          <span className="size-2 animate-ping rounded-full bg-blue-500" aria-hidden="true" />
          {t("common.loading")}
        </span>
        <p>{t("questions.flow.loading", { defaultValue: "Loading chatbot flow..." })}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-6">
        <p className="text-sm text-slate-600">{t("questions.flow.error")}</p>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
          <RotateCw className="size-4" />
          {t("common.refresh")}
        </Button>
      </div>
    );
  }

  if (!flowData.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-6 text-center">
        <p className="text-sm text-slate-600">{t("questions.flow.empty", { defaultValue: "No flow data available." })}</p>
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(fromSearch ? `${ROUTERS.QUESTION_MANAGEMENT}${fromSearch}` : ROUTERS.QUESTION_MANAGEMENT)}>
          <ArrowLeft className="size-4" />
          {t("questions.flow.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(fromSearch ? `${ROUTERS.QUESTION_MANAGEMENT}${fromSearch}` : ROUTERS.QUESTION_MANAGEMENT)}
          className="w-fit gap-2"
          aria-label={t("questions.flow.back")}
        >
          <ArrowLeft className="size-4" />
          {t("questions.flow.back")}
        </Button>
        <h1 className="text-lg font-semibold text-slate-800">{t("questions.flow.title")}</h1>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-blue-100 bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          minZoom={0.2}
          nodesConnectable
          nodesDraggable
          onInit={(instance) => {
            reactFlowInstanceRef.current = instance;
          }}
          onNodesChange={onNodesChange as OnNodesChange}
          onNodeDragStart={handleNodeDragStart}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onConnect={handleConnect}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
        >
          <MiniMap position="bottom-right" />
          <Controls />
          <Background color="#E2E8F0" gap={16} />
        </ReactFlow>
      </div>

      <Dialog open={confirmState.isOpen} onOpenChange={(open) => (!open ? handleDialogClose() : null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {t("questions.flow.delete_line_title", { defaultValue: "Remove connection" })}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {t("questions.flow.delete_line_message", { defaultValue: "Are you sure you want to remove this connection?" })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {confirmState.answerLabel ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500">{t("questions.flow.answer_label", { defaultValue: "Answer" })}</span>
                <span className="text-slate-800">{confirmState.answerLabel}</span>
              </div>
            ) : null}
            {confirmState.questionLabel ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500">{t("questions.flow.target_label", { defaultValue: "Next question" })}</span>
                <span className="text-slate-800">{confirmState.questionLabel}</span>
              </div>
            ) : null}
          </div>
          <DialogFooter className="flex-row gap-3">
            <Button type="button" variant="outline" onClick={handleDialogClose} disabled={updateLineMutation.isPending} className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={updateLineMutation.isPending}
              className="flex-1 border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700"
            >
              {updateLineMutation.isPending ? t("common.deleting") : t("questions.flow.delete_line_confirm", { defaultValue: "Remove" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuestionDeleteDialog
        isOpen={deleteOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteChatbot}
        target={deleteTarget}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default QuestionFlowPage;
