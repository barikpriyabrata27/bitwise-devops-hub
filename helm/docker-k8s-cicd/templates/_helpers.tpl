{{- define "docker-k8s-cicd.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "docker-k8s-cicd.fullname" -}}
{{- default (include "docker-k8s-cicd.name" .) .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "docker-k8s-cicd.labels" -}}
app.kubernetes.io/name: {{ include "docker-k8s-cicd.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end }}

{{- define "docker-k8s-cicd.selectorLabels" -}}
app.kubernetes.io/name: {{ include "docker-k8s-cicd.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}