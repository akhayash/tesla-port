# Streamlit Instructions

## プロジェクト構成

```
app.py                  # メインエントリーポイント
pages/
  1_dashboard.py        # ページ（番号プレフィックスで順序制御）
  2_settings.py
components/
  sidebar.py            # 再利用可能なコンポーネント
  charts.py
utils/
  data.py               # データ処理ユーティリティ
  api.py                # 外部 API 連携
.streamlit/
  config.toml           # Streamlit 設定
  secrets.toml           # ローカル秘密情報（.gitignore 対象）
requirements.txt
```

## コーディング規約

### ページ構成

```python
import streamlit as st

st.set_page_config(
    page_title="Page Title",
    page_icon="📊",
    layout="wide",
)

st.title("Page Title")
```

- `st.set_page_config()` は**必ず最初に**呼ぶ
- 各ページの先頭でタイトルとアイコンを設定する

### 状態管理

```python
# 初期化パターン
if "counter" not in st.session_state:
    st.session_state.counter = 0

# 更新
st.session_state.counter += 1
```

- グローバル変数ではなく `st.session_state` を使う
- 初期化は `if key not in st.session_state` パターン

### キャッシュ

```python
@st.cache_data(ttl=3600)
def load_data():
    # データロード処理
    return data

@st.cache_resource
def get_db_connection():
    # DB 接続（セッション間で共有）
    return conn
```

- データ取得には `@st.cache_data`
- DB 接続やモデルには `@st.cache_resource`
- `ttl` パラメータで有効期限を設定する

### フォーム

```python
with st.form("my_form"):
    name = st.text_input("Name")
    submitted = st.form_submit_button("Submit")
    if submitted:
        process(name)
```

- 複数入力をまとめるには `st.form` を使う
- `st.form_submit_button` でまとめて送信する

## レイアウト

- `st.columns()` で横並びレイアウト
- `st.sidebar` でサイドバーに配置
- `st.tabs()` でタブ切り替え
- `st.expander()` で折りたたみ

## 型ヒント

- 関数の引数と戻り値に型ヒントを付ける
- `pandas.DataFrame` の型は明示する

## テスト

- ビジネスロジックは `utils/` に分離してテスト可能にする
- Streamlit UI のテストは `streamlit.testing` を使用する
