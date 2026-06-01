import { lazy, Suspense, useState } from "react";
import { ModusWcTypography } from "@trimble-oss/moduswebcomponents-react";
import { AppShellLayout } from './layouts';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { HomeOverviewPage } from './pages/HomeOverviewPage';
import './App.css';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);

const CostPage = lazy(() =>
  import('./pages/CostPage').then((module) => ({ default: module.CostPage })),
);

const DocumentsPage = lazy(() =>
  import('./pages/DocumentsPage').then((module) => ({ default: module.DocumentsPage })),
);

export default function App() {
  const [selectedItem, setSelectedItem] = useState("home");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [items, setItems] = useState([
    { id: "1", label: "Item 1", description: "Description" },
    { id: "2", label: "Item 2", description: "Description" },
    { id: "3", label: "Item 3", description: "Description" },
    { id: "4", label: "Item 4", description: "Description" },
    { id: "5", label: "Item 5", description: "Description" },
    { id: "6", label: "Item 6", description: "Description" },
  ]);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const modalId = "app-shell-create-item-modal";
  const isDocuments = selectedItem === "documents";

  const openCreateModal = () => {
    setNewItemLabel("");
    setNewItemDescription("");
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal?.showModal) modal.showModal();
  };

  const closeCreateModal = () => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal?.close) modal.close();
  };

  const handleCreateItem = () => {
    if (newItemLabel.trim()) {
      setItems((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          label: newItemLabel.trim(),
          description: newItemDescription.trim() || "Description",
        },
      ]);
      closeCreateModal();
    }
  };

  return (
    <AppShellLayout
      contentId="app-shell-content"
      className={`app-shell-preview min-h-[700px]${isDocuments ? " file-storage-preview" : ""}`}
      constrainMainContentWidth
      useContainerWidth={isDocuments}
      contentClassName={
        isDocuments
          ? "flex flex-col flex-1 min-h-0 min-w-0 !p-0"
          : selectedItem === "dashboard" || selectedItem === "cost"
            ? "space-y-6 min-w-0 min-h-0 overflow-x-hidden"
            : undefined
      }
      selectedMenuItem={selectedItem}
      onMenuItemSelect={(e: CustomEvent<{ value: string }>) => {
        if (e.detail?.value) setSelectedItem(e.detail.value);
      }}
    >
      {selectedItem === 'activities' ? (
        <ActivitiesPage onNavigateHome={() => setSelectedItem('home')} />
      ) : isDocuments ? (
        <Suspense
          fallback={
            <ModusWcTypography
              hierarchy="p"
              size="md"
              customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
              label="Loading file storage…"
            />
          }
        >
          <div className="w-full min-w-0 min-h-0 flex flex-col flex-1 px-4 sm:px-6 pb-6 pt-4 box-border">
            <DocumentsPage />
          </div>
        </Suspense>
      ) : selectedItem === 'cost' ? (
        <Suspense
          fallback={
            <ModusWcTypography
              hierarchy="p"
              size="md"
              customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
              label="Loading financial dashboard…"
            />
          }
        >
          <CostPage />
        </Suspense>
      ) : selectedItem === 'dashboard' ? (
        <Suspense
          fallback={
            <ModusWcTypography
              hierarchy="p"
              size="md"
              customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
              label="Loading dashboard…"
            />
          }
        >
          <DashboardPage />
        </Suspense>
      ) : (
        <HomeOverviewPage
          items={items}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNavigateHome={() => setSelectedItem("home")}
          modalId={modalId}
          newItemLabel={newItemLabel}
          newItemDescription={newItemDescription}
          onNewItemLabelChange={setNewItemLabel}
          onNewItemDescriptionChange={setNewItemDescription}
          onOpenCreateModal={openCreateModal}
          onCloseCreateModal={closeCreateModal}
          onCreateItem={handleCreateItem}
        />
      )}
    </AppShellLayout>
  );
}
