CREATE TABLE datasets (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX datasets_project_idx ON datasets (project_id);

CREATE TABLE dataset_items (
    id UUID PRIMARY KEY,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected TEXT NOT NULL DEFAULT ''
);

CREATE INDEX dataset_items_dataset_idx ON dataset_items (dataset_id);

CREATE TABLE evaluators (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kind TEXT NOT NULL
);

CREATE INDEX evaluators_project_idx ON evaluators (project_id);

CREATE TABLE eval_runs (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    dataset_id UUID NOT NULL,
    evaluator_id UUID NOT NULL,
    mean_score DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX eval_runs_project_idx ON eval_runs (project_id, created_at DESC);
