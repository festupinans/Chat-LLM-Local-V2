import tkinter as tk
from tkinter import messagebox
import subprocess
import webbrowser
import os
import sys
import threading

class ControlPanel:
    def __init__(self, root):
        self.root = root
        self.root.title("Panel de control NEO")
        self.root.geometry("400x350")
        self.root.configure(bg="#ffffff")
        self.process = None
        self.console_visible = False

        # Fuentes y colores
        font_title = ("Segoe UI", 16, "bold")
        font_btn = ("Segoe UI", 10, "bold")
        font_status = ("Segoe UI", 12, "bold")
        bg_color = "#ffffff"
        fg_color = "#000000"

        # Estética básica
        tk.Label(root, text="Gestor de Servidor Local", font=font_title, bg=bg_color, fg=fg_color).pack(pady=15)

        # Indicador de estado
        self.lbl_status = tk.Label(root, text="⚫ Estado: Detenido", font=font_status, bg=bg_color, fg="#ff5555")
        self.lbl_status.pack(pady=5)

        # Frame para botones
        btn_frame = tk.Frame(root, bg=bg_color)
        btn_frame.pack(pady=10)

        # Botón Iniciar
        self.btn_start = tk.Button(btn_frame, text="🚀 Iniciar NEO", command=self.start_node, 
                                   bg="#50fa7b", fg="#282a36", activebackground="#5af78e", width=25, height=2, font=font_btn, relief="flat", cursor="hand2")
        self.btn_start.pack(pady=5)

        # Botón Detener
        self.btn_stop = tk.Button(btn_frame, text="🛑 Detener NEO", command=self.stop_node, 
                                  bg="#ff5555", fg="white", disabledforeground="white", activebackground="#ff6e6e", width=25, height=2, state=tk.DISABLED, font=font_btn, relief="flat", cursor="hand2")
        self.btn_stop.pack(pady=5)
        
        # Botón Abrir Navegador
        self.btn_web = tk.Button(btn_frame, text="🌐 Abrir Navegador", command=self.open_browser, 
                                 bg="#8be9fd", fg="#282a36", activebackground="#9aedfe", width=25, height=2, font=font_btn, relief="flat", cursor="hand2")
        self.btn_web.pack(pady=5)

        # Botón Consola
        self.btn_console = tk.Button(root, text="👁 Mostrar Consola", command=self.toggle_console, 
                                     bg="#6272a4", fg="white", activebackground="#7486c4", width=20, font=("Segoe UI", 9), relief="flat", cursor="hand2")
        self.btn_console.pack(pady=5)

        # Consola (Text widget)
        self.console_text = tk.Text(root, bg="#1e1e1e", fg="#00ff00", font=("Consolas", 9), height=15)
        self.console_text.insert(tk.END, "Esperando inicio del servidor...\n")
        self.console_text.config(state=tk.DISABLED)

    def start_node(self):
        try:
            # Obtener el directorio real donde reside el .exe usando sys
            if getattr(sys, 'frozen', False):
                current_dir = os.path.dirname(sys.executable)
            else:
                current_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Iniciar el proceso y redirigir la salida
            self.process = subprocess.Popen(["npm", "run", "dev"], 
                                            cwd=current_dir, 
                                            shell=True,
                                            stdout=subprocess.PIPE,
                                            stderr=subprocess.STDOUT,
                                            text=True)
            
            self.btn_start.config(state=tk.DISABLED)
            self.btn_stop.config(state=tk.NORMAL)
            self.lbl_status.config(text="🟢 Estado: Ejecutándose", fg="#50fa7b")
            
            # Iniciar hilo para leer la consola
            threading.Thread(target=self.read_console, daemon=True).start()

        except Exception as e:
            messagebox.showerror("Error", f"No se pudo iniciar: {e}")

    def stop_node(self):
        if self.process:
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(self.process.pid)])
            self.process = None
            self.btn_start.config(state=tk.NORMAL)
            self.btn_stop.config(state=tk.DISABLED)
            self.lbl_status.config(text="⚫ Estado: Detenido", fg="#ff5555")
            self.write_console("\n[SISTEMA] El servidor se ha detenido.\n")

    def toggle_console(self):
        if self.console_visible:
            self.console_text.pack_forget()
            self.btn_console.config(text="👁 Mostrar Consola")
            self.root.geometry("400x350")
            self.console_visible = False
        else:
            self.console_text.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)
            self.btn_console.config(text="🙈 Ocultar Consola")
            self.root.geometry("500x550")
            self.console_visible = True

    def write_console(self, text):
        self.console_text.config(state=tk.NORMAL)
        self.console_text.insert(tk.END, text)
        self.console_text.see(tk.END)
        self.console_text.config(state=tk.DISABLED)

    def read_console(self):
        if self.process is None:
            return
        
        self.write_console("[SISTEMA] Servidor iniciando...\n")
        for line in iter(self.process.stdout.readline, ''):
            if not line:
                break
            # Actualizamos la interfaz en el hilo principal
            self.root.after(0, self.write_console, line)
        
        if self.process:
            self.process.stdout.close()

    def open_browser(self):
        webbrowser.open("http://localhost:5173")

if __name__ == "__main__":
    root = tk.Tk()
    app = ControlPanel(root)
    root.mainloop()