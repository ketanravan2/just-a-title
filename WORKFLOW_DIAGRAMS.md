# Serial Assignment System - Workflow Diagrams

## 1. Index Page Workflow

```mermaid
flowchart TD
    A[User visits /] --> B[Index Page Loads]
    B --> C[Display Feature Cards]
    C --> D[User clicks ASN Button]
    C --> E[User clicks Serials Button]
    D --> F[Navigate to /asn]
    E --> G[Navigate to /serials]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style F fill:#e8f5e8
    style G fill:#e8f5e8
```

## 2. Serials Page Workflow

```mermaid
flowchart TD
    A[User visits /serials] --> B[Load AppStateContext]
    B --> C[SerialAssignmentInterface Renders]
    C --> D[Display Serial Grid]
    
    D --> E[User searches/filters]
    E --> F[Filtered results display]
    
    D --> G[User selects serials]
    G --> H[Update selection state]
    
    H --> I[User clicks Assign]
    H --> J[User clicks Create]
    H --> K[User clicks Import]
    
    I --> L[AssignmentDialog opens]
    L --> M[User selects target]
    M --> N[Call assignSerials]
    N --> O[Update serial status]
    O --> P[Refresh UI]
    
    J --> Q[CreateSerialDialog opens]
    Q --> R[User fills form]
    R --> S[Validate data]
    S --> T[Call createSerial]
    T --> U[Add to serials array]
    U --> P
    
    K --> V[ImportCSVDialog opens]
    V --> W[User uploads CSV]
    W --> X[Parse CSV data]
    X --> Y[Call importSerialsFromCSV]
    Y --> U
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style P fill:#e8f5e8
```

## 3. ASN Page Workflow

```mermaid
flowchart TD
    A[User visits /asn] --> B[Load ASN Hierarchy + Serials]
    B --> C[Display Tabbed Interface]
    
    C --> D[ASN Hierarchy Tab]
    C --> E[Serial Grid Tab]
    C --> F[Individual Assignment Tab]
    
    D --> G[ASNHierarchyView Renders]
    G --> H[Display Item Tree]
    H --> I[User clicks Item/Lot]
    I --> J[AssignmentDialog opens]
    J --> K[User selects assignment type]
    K --> L[Navigate to /assignment with context]
    
    E --> M[SerialAssignmentInterface Renders]
    M --> N[Display serial grid]
    N --> O[User manages serials]
    
    F --> P[IndividualAssignment Renders]
    P --> Q[One-by-one assignment interface]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style L fill:#e8f5e8
```

## 4. Assignment Page Workflow

```mermaid
flowchart TD
    A[User arrives at /assignment] --> B[Parse URL Parameters]
    B --> C[Extract assignment context]
    C --> D[Filter serials by context]
    D --> E[SerialAssignmentInterface renders]
    
    E --> F[Display filtered serials]
    F --> G[User selects serials]
    G --> H[User clicks Assign]
    H --> I[Call assignSerials with context]
    I --> J[Update serial assignments]
    J --> K[Show success toast]
    K --> L[Navigate back to /asn]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style L fill:#e8f5e8
```

## 5. Serial Assignment Flow (Detailed)

```mermaid
flowchart TD
    A[User selects serials] --> B[Update selectedSerials state]
    B --> C[User clicks Assign button]
    C --> D[Check if serials are selectable]
    D --> E{Valid selection?}
    
    E -->|No| F[Show error message]
    E -->|Yes| G[Open AssignmentDialog]
    
    G --> H[Display available targets]
    H --> I[User selects target]
    I --> J[Validate assignment]
    J --> K{Assignment valid?}
    
    K -->|No| L[Show validation error]
    K -->|Yes| M[Call assignSerials function]
    
    M --> N[Update serial status]
    N --> O[Update assignment details]
    O --> P[Refresh component state]
    P --> Q[Show success notification]
    
    style A fill:#e1f5fe
    style M fill:#f3e5f5
    style Q fill:#e8f5e8
```

## 6. Serial Creation Flow

```mermaid
flowchart TD
    A[User clicks Create Serial] --> B[Open CreateSerialDialog]
    B --> C[Display creation form]
    C --> D[User fills serial number]
    C --> E[User selects buyer part number]
    C --> F[User adds custom attributes]
    
    D --> G[Validate serial number]
    E --> H[Validate part number]
    F --> I[Validate attributes]
    
    G --> J{All valid?}
    H --> J
    I --> J
    
    J -->|No| K[Show validation errors]
    J -->|Yes| L[Call createSerial function]
    
    L --> M[Generate unique ID]
    M --> N[Create serial object]
    N --> O[Add to serials array]
    O --> P[Update AppStateContext]
    P --> Q[Close dialog]
    Q --> R[Refresh serial grid]
    R --> S[Show success notification]
    
    style A fill:#e1f5fe
    style L fill:#f3e5f5
    style S fill:#e8f5e8
```

## 7. State Management Flow

```mermaid
flowchart TD
    A[Component Action] --> B[Call Context Function]
    B --> C[Update State]
    C --> D[Trigger Re-render]
    D --> E[Update UI]
    
    subgraph "Context Functions"
        F[assignSerials]
        G[createSerial]
        H[bulkCreateSerials]
        I[importSerialsFromCSV]
        J[linkChildSerials]
    end
    
    subgraph "State Updates"
        K[Update serials array]
        L[Update assignment details]
        M[Update status]
        N[Update timestamps]
    end
    
    B --> F
    B --> G
    B --> H
    B --> I
    B --> J
    
    C --> K
    C --> L
    C --> M
    C --> N
    
    style A fill:#e1f5fe
    style E fill:#e8f5e8
```

## 8. ASN Hierarchy Navigation Flow

```mermaid
flowchart TD
    A[ASNHierarchyView loads] --> B[Display item tree]
    B --> C[User clicks on item]
    B --> D[User clicks on lot]
    B --> E[User clicks on packing unit]
    
    C --> F[Show item details]
    D --> G[Show lot details]
    E --> H[Show packing details]
    
    F --> I[User clicks assign]
    G --> I
    H --> I
    
    I --> J[Create assignment context]
    J --> K[Navigate to /assignment]
    K --> L[Assignment page loads with context]
    
    style A fill:#e1f5fe
    style L fill:#e8f5e8
```

## 9. Bulk Operations Flow

```mermaid
flowchart TD
    A[User selects multiple serials] --> B[Update bulk selection state]
    B --> C[ActionBar shows bulk options]
    
    C --> D[User clicks Bulk Assign]
    C --> E[User clicks Bulk Create]
    C --> F[User clicks Bulk Import]
    
    D --> G[Open AssignmentDialog]
    G --> H[User selects target]
    H --> I[Assign all selected serials]
    
    E --> J[Open BulkCreateDialog]
    J --> K[User sets prefix and count]
    K --> L[Generate serial numbers]
    L --> M[Create serial objects]
    
    F --> N[Open ImportCSVDialog]
    N --> O[User uploads CSV file]
    O --> P[Parse CSV data]
    P --> Q[Create serial objects]
    
    I --> R[Update serial states]
    M --> R
    Q --> R
    
    R --> S[Refresh UI]
    S --> T[Show success notification]
    
    style A fill:#e1f5fe
    style T fill:#e8f5e8
```

## 10. Error Handling Flow

```mermaid
flowchart TD
    A[User Action] --> B[Validate Input]
    B --> C{Validation passes?}
    
    C -->|No| D[Show validation error]
    C -->|Yes| E[Execute action]
    
    E --> F{Action succeeds?}
    F -->|No| G[Show error message]
    F -->|Yes| H[Update state]
    
    H --> I[Show success message]
    
    D --> J[User corrects input]
    G --> K[User retries action]
    
    J --> B
    K --> E
    
    style A fill:#e1f5fe
    style I fill:#e8f5e8
    style D fill:#ffebee
    style G fill:#ffebee
```

## Component Interaction Diagram

```mermaid
graph TB
    subgraph "Pages"
        A[Index]
        B[Serials]
        C[ASN]
        D[Assignment]
    end
    
    subgraph "Core Components"
        E[SerialAssignmentInterface]
        F[ASNHierarchyView]
        G[SerialCard]
        H[ActionBar]
    end
    
    subgraph "Dialogs"
        I[AssignmentDialog]
        J[CreateSerialDialog]
        K[BulkCreateDialog]
        L[ImportCSVDialog]
    end
    
    subgraph "State Management"
        M[AppStateContext]
    end
    
    A --> B
    A --> C
    C --> D
    
    B --> E
    C --> F
    C --> E
    
    E --> G
    E --> H
    E --> I
    E --> J
    E --> K
    E --> L
    
    B --> M
    C --> M
    D --> M
    E --> M
    
    style M fill:#f3e5f5
    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#e1f5fe
    style D fill:#e1f5fe
``` 