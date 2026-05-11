import { useState } from "react";
import {
  ModusWcTypography,
  ModusWcIcon,
  ModusWcBreadcrumbs,
  ModusWcTabs,
  ModusWcButton,
  ModusWcCard,
  ModusWcModal,
  ModusWcTextInput,
  ModusWcInputLabel,
} from "@trimble-oss/moduswebcomponents-react";
import { AppShellLayout } from './layouts';
import './App.css';

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
      className="app-shell-preview min-h-[700px]"
      useContainerWidth
      constrainMainContentWidth
      selectedMenuItem={selectedItem}
      onMenuItemSelect={(e: CustomEvent<{ value: string }>) => {
        if (e.detail?.value) setSelectedItem(e.detail.value);
      }}
    >
      <ModusWcBreadcrumbs
            items={[
              { label: "Home", url: "#" },
              { label: "Dashboard", url: "#" },
              { label: "Overview", url: "#" },
            ]}
          />
          <div data-app-shell-preview className="app-shell-preview-wrapper">
          <div className="app-shell-preview-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap mb-3">
            <div className="flex items-center gap-1">
              <ModusWcIcon
                name="cube"
                size="md"
                customClass="text-[var(--modus-wc-color-base-content)]"
                decorative
              />
              <ModusWcTypography
                hierarchy="h1"
                size="3xl"
                weight="light"
                label="Overview"
              />
            </div>
            <div className="flex items-center gap-2">
              <ModusWcButton
                variant={viewMode === "grid" ? "filled" : "borderless"}
                color="tertiary"
                shape="square"
                size="sm"
                onButtonClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <ModusWcIcon name="view_grid" decorative />
              </ModusWcButton>
              <ModusWcButton
                variant={viewMode === "list" ? "filled" : "borderless"}
                color="tertiary"
                shape="square"
                size="sm"
                onButtonClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <ModusWcIcon name="view_list" decorative />
              </ModusWcButton>
              <ModusWcButton
                variant="filled"
                color="primary"
                size="sm"
                onButtonClick={openCreateModal}
              >
                <ModusWcIcon name="add" size="xs" decorative />
                Create Item
              </ModusWcButton>
            </div>
          </div>
          <div className="tabs-scroll-wrapper">
            <ModusWcTabs
              tabs={[
                { label: "Overview" },
                { label: "Analytics" },
                { label: "Reports" },
              ]}
              activeTabIndex={0}
            />
          </div>
          <div
            className={`app-shell-preview-grid flex-1 overflow-auto gap-3 mt-3 ${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col"
            }`}
          >
            {viewMode === "grid" ? (
              <>
                {items.map((item) => (
                  <ModusWcCard key={item.id} bordered={false}>
                    <ModusWcTypography
                      slot="title"
                      hierarchy="p"
                      size="sm"
                      weight="semibold"
                      label={item.label}
                    />
                    <ModusWcTypography
                      slot="subtitle"
                      hierarchy="p"
                      size="xs"
                      customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                      label={item.description}
                    />
                  </ModusWcCard>
                ))}
              </>
            ) : (
              <>
                {items.map((item) => (
                  <ModusWcCard
                    key={item.id}
                    bordered={false}
                    customClass="app-shell-list-card w-full min-w-full flex items-center gap-4 justify-start text-left"
                  >
                    <ModusWcTypography
                      slot="title"
                      hierarchy="p"
                      size="sm"
                      weight="semibold"
                      label={item.label}
                    />
                    <ModusWcTypography
                      slot="subtitle"
                      hierarchy="p"
                      size="xs"
                      customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                      label={item.description}
                    />
                  </ModusWcCard>
                ))}
              </>
            )}
          </div>
          </div>

      <ModusWcModal modalId={modalId} customClass="sm:max-w-[425px]">
        <ModusWcTypography
          slot="header"
          hierarchy="h2"
          size="lg"
          weight="semibold"
          label="Create Item"
        />
        <div slot="content" className="flex flex-col gap-2 py-4">
          <div className="flex flex-col gap-2">
            <ModusWcInputLabel
              forId="create-item-label"
              labelText="Name"
            />
            <ModusWcTextInput
              inputId="create-item-label"
              value={newItemLabel}
              onInputChange={(e: CustomEvent) => {
                const val = e.detail?.target?.value ?? "";
                setNewItemLabel(val);
              }}
              customClass="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <ModusWcInputLabel
              forId="create-item-description"
              labelText="Description"
            />
            <ModusWcTextInput
              inputId="create-item-description"
              value={newItemDescription}
              onInputChange={(e: CustomEvent) => {
                const val = e.detail?.target?.value ?? "";
                setNewItemDescription(val);
              }}
              customClass="w-full"
            />
          </div>
        </div>
        <div slot="footer" className="flex justify-end gap-2">
          <ModusWcButton
            variant="outlined"
            color="tertiary"
            onButtonClick={closeCreateModal}
          >
            Cancel
          </ModusWcButton>
          <ModusWcButton
            variant="filled"
            color="primary"
            onButtonClick={handleCreateItem}
          >
            Create
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </AppShellLayout>
  );
}
