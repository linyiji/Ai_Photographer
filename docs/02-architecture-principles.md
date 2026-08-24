# 02｜Architecture Principles

## Global Definition First

开发业务模块前先统一：

- PhotographySession
- WorkflowState
- Data Contract
- Module Boundary
- Domain Event
- Error Contract
- AssetRef
- Versioning
- Observability
- Platform Contract

## Modular Delivery Second

独立模块：

- Reality
- Target
- Shot
- Live
- Capture
- QA
- Enhancement
- Final
- Commerce

Global/Core 必须薄，只承担协议、状态、事件、错误和基础设施约束。

禁止将完整 Photography Workflow 堆在单一页面、Service、Agent 或 Core Module 中。

模块之间只通过：

1. Public Interface
2. Data Contract
3. Domain Event

协作。
