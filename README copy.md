# auth

## Command to update all files
```sh
yarn eslint --fix source --ext .ts
```

## Configuration of Visual Studio Code
settings.json
```json
{
    "window.zoomLevel": -2,
    "workbench.colorTheme": "Dracula",
    "editor.fontFamily": "Fira Code",
    "editor.fontLigatures": true,

    // Aumenta a fonte do terminal
    "editor.fontSize": 14,

    // Aplica linhas verticais para lembrar de quebrar a linha em códigos muito grandes
    "editor.rulers": [
        80,
        120
    ],

    // Aplica um sinal visual na esquerda da linha selecionada
    "editor.renderLineHighlight": "gutter",
    "editor.tabSize": 2,
    "terminal.integrated.fontSize": 14,

    //"editor.parameterHints.enabled": false,
    "breadcrumbs.enabled": true,

    "javascript.suggest.autoImports": false,
    "explorer.confirmDragAndDrop": false,
    "editor.formatOnSave": true,
    "[javascript]": {
        "editor.codeActionsOnSave": {
            "source.fixAll.eslint": true
        }
    },
    "[javascriptreact]": {
        "editor.codeActionsOnSave": {
            "source.fixAll.eslint": true
        }
    },
    "typescript.updateImportsOnFileMove.enabled": "always",
    "eslint.alwaysShowStatus": true,
    "eslint.format.enable": true,
    "eslint.packageManager": "yarn",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
}
```
