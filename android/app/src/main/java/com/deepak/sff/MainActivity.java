package com.deepak.sff;

import android.os.Bundle;
import android.graphics.Color;
import android.view.View;
import android.view.Window;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // Status bar must not be transparent
        window.setStatusBarColor(Color.rgb(10, 15, 30));

        // Do NOT allow WebView content behind system status bar
        View root = findViewById(android.R.id.content);

        ViewCompat.setOnApplyWindowInsetsListener(root, (view, insets) -> {
            int top = insets.getInsets(
                WindowInsetsCompat.Type.statusBars()
            ).top;

            view.setPadding(
                view.getPaddingLeft(),
                top,
                view.getPaddingRight(),
                view.getPaddingBottom()
            );

            return insets;
        });

        ViewCompat.requestApplyInsets(root);
    }
}
